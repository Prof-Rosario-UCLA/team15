import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { backendService } from './BackendService';
// Use type-only import for ServiceWithHealth and remove unused Service import
import type { ServiceWithHealth } from './types'; 
import { useAuth } from './AuthContext';
import * as healthPb from '../gen/ts/proto/health/v1/health_pb'; // Import Status enum

interface ServicesContextType {
  services: ServiceWithHealth[];
  isLoading: boolean;
  error?: string;
  refreshServices: () => Promise<void>;
  selectedService: string | null;
  setSelectedService: (serviceId: string | null) => void;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};

interface ServicesProviderProps {
  children: ReactNode;
}

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
  const [services, setServices] = useState<ServiceWithHealth[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const healthStreamsRef = useRef<Map<string, any>>(new Map());
  const { isAuthenticated, handleTokenExpiration } = useAuth();

  const refreshServices = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping service refresh');
      return;
    }

    console.log('Starting service refresh...');
    setIsLoading(true);
    setError(undefined);

    try {
      console.log('Fetching services from backend...');
      const serviceData = await backendService.fetchServices();
      console.log('Received services:', serviceData);
      
      // Directly use serviceData as it should now match Service[]
      // No need to map if BackendService.fetchServices() returns Service.AsObject[]
      // and Service type is an alias for Service.AsObject
      setServices(serviceData.map(s => ({ ...s, health: undefined }) )); // Initialize with undefined health

      // Start health monitoring for each service
      console.log('Starting health monitoring for all services...');
      serviceData.forEach(service => {
        startHealthMonitoring(service.id);
      });
      
    } catch (err) {
      console.error('Failed to fetch services (full error object):', err); // Log the full error
      // Check if the error object has gRPC-specific properties
      if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
        console.error(`gRPC Error Code: ${(err as any).code}, Message: ${(err as any).message}`);
        
        // Check if it's a token expiration error (code 16 = UNAUTHENTICATED)
        if ((err as any).code === 16 && (err as any).message?.includes('expired')) {
          handleTokenExpiration(); // Clear token and redirect to login
          return; // Don't set error state, let auth context handle it
        }
        
        setError(`Failed to fetch services: gRPC Code ${(err as any).code} - ${(err as any).message}`);
      } else {
        setError('Failed to fetch services');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, handleTokenExpiration]); // Add handleTokenExpiration to dependencies

  const startHealthMonitoring = useCallback((serviceId: string) => {
    console.log(`Starting health monitoring for service: ${serviceId}`);
    
    // Clean up existing stream if any
    const existingStream = healthStreamsRef.current.get(serviceId);
    if (existingStream) {
      console.log(`Cancelling existing stream for service: ${serviceId}`);
      existingStream.cancel();
    }

    const stream = backendService.watchServiceHealth(
      serviceId,
      (healthData: healthPb.WatchHealthResponse.AsObject) => { // Use the specific gRPC type
        console.log(`[ServicesContext] Received health data for ${healthData.serviceId} (stream for ${serviceId}):`, healthData);
        setServices(prevServices => {
          console.log(`[ServicesContext] Updating services for ${healthData.serviceId}. Previous services count: ${prevServices.length}`);
          const updatedServices = prevServices.map(service => {
            // Use healthData.serviceId from the payload for matching
            if (service.id === healthData.serviceId) {
              console.log(`[ServicesContext] Matched service ${service.id}. Updating health. Old health:`, service.health, "New health:", healthData);
              return { ...service, health: healthData };
            }
            return service;
          });
          const updatedServiceForLog = updatedServices.find(s => s.id === healthData.serviceId);
          console.log(`[ServicesContext] Service ${healthData.serviceId} in updatedServices array after map:`, updatedServiceForLog);
          // To avoid excessive logging, comment out the next line if it's too verbose
          // console.log(`[ServicesContext] Full updatedServices array for ${healthData.serviceId}:`, updatedServices);
          return updatedServices;
        });
      },
      (error) => {
        console.error(`Health monitoring error for ${serviceId}:`, error);
        // Also check for token expiration in health monitoring
        if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
          if ((error as any).code === 16 && (error as any).message?.includes('expired')) {
            handleTokenExpiration();
            return;
          }
        }
      }
    );

    if (stream) {
      console.log(`Health stream created for service: ${serviceId}`);
      healthStreamsRef.current.set(serviceId, stream);
    } else {
      console.error(`Failed to create health stream for service: ${serviceId}`);
    }
  }, [handleTokenExpiration]); // Remove healthStreams from dependencies

  useEffect(() => {
    if (isAuthenticated) {
      refreshServices();
    } else {
      // Clean up streams when not authenticated
      healthStreamsRef.current.forEach((stream: any) => stream.cancel());
      healthStreamsRef.current.clear();
      setServices([]);
    }

    return () => {
      // Cleanup on unmount
      healthStreamsRef.current.forEach((stream: any) => stream.cancel());
    };
  }, [isAuthenticated, refreshServices]);

  const value: ServicesContextType = {
    services,
    isLoading,
    error,
    refreshServices,
    selectedService,
    setSelectedService,
  };

  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
};
