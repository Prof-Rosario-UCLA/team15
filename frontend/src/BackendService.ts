// src/services/BackendService.ts
import * as grpcWeb from 'grpc-web';
// Import the generated gRPC client files using the npm packages
import * as healthGrpc from '../gen/ts/proto/health/v1/HealthServiceClientPb';
import * as catalogGrpc from '../gen/ts/proto/catalog/v1/CatalogServiceClientPb';
import * as healthPb from '../gen/ts/proto/health/v1/health_pb';
import * as catalogPb from '../gen/ts/proto/catalog/v1/catalog_pb';

// Types for the service objects
// interface ServiceObject {
//  [key: string]: any; // Adjust based on your actual service proto structure
// }

// interface HealthObject {
//  [key: string]: any; // Adjust based on your actual health proto structure
// }

// Type for stream handlers
type HealthUpdateHandler = (health: healthPb.WatchHealthResponse.AsObject) => void;
type ErrorHandler = (error: grpcWeb.RpcError) => void;

export class BackendService {
  private baseUrl: string;
  private healthClient: healthGrpc.HealthServiceClient;
  private catalogClient: catalogGrpc.CatalogServiceClient;

  constructor(baseUrl?: string) {
    // Use current origin in production, localhost in development
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080');
    
    // Configure gRPC-Web clients with streaming options
    const options = {
      unaryInterceptors: [],
      streamInterceptors: [],
      debug: true, // Enable debug mode to see what's happening
      withCredentials: false,
      format: 'text' // Use grpc-web-text format for better browser compatibility
    };
    
    this.healthClient = new healthGrpc.HealthServiceClient(this.baseUrl, null, options);
    this.catalogClient = new catalogGrpc.CatalogServiceClient(this.baseUrl, null, options);
  }

  // REST login; JWT stored in HttpOnly cookie automatically
  async login(username: string, password: string): Promise<boolean> {
    try {
      const resp = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (resp.ok) {
        // Extract JWT token from response body for gRPC calls
        const data = await resp.json();
        if (data.token) {
          // Store token for gRPC calls (since gRPC-Web doesn't auto-include cookies)
          localStorage.setItem('jwt_token', data.token);
        }
      }
      
      return resp.ok;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  // gRPC calls need manual JWT token inclusion
  private createMetadata(): grpcWeb.Metadata {
    const token = localStorage.getItem('jwt_token');
    const metadata: grpcWeb.Metadata = {};
    
    if (token) {
      metadata['authorization'] = `Bearer ${token}`;
    }
    
    return metadata;
  }

  // Stream listServices()
  fetchServices(): Promise<catalogPb.Service.AsObject[]> {
    return new Promise((resolve, reject) => {
      try {
        const req = new catalogPb.ListServicesRequest();
        const stream = this.catalogClient.listServices(req, this.createMetadata());
        const result: catalogPb.Service.AsObject[] = [];
        
        stream.on('data', (msg: catalogPb.ListServicesResponse) => {
          msg.getServicesList().forEach(s => result.push(s.toObject()));
        });
        
        stream.on('end', () => resolve(result));
        stream.on('error', (err: grpcWeb.RpcError) => reject(err));
      } catch (error) {
        reject(error);
      }
    });
  }  // Stream watchHealth()
  watchServiceHealth(
    serviceId: string, 
    onUpdate?: HealthUpdateHandler, 
    onError?: ErrorHandler
  ): grpcWeb.ClientReadableStream<healthPb.WatchHealthResponse> | undefined {
    try {
      console.log(`Starting health stream for service: ${serviceId}`);
      const req = new healthPb.WatchHealthRequest();
      req.setServiceId(serviceId);
      
      const metadata = this.createMetadata();
      console.log('Using metadata:', metadata);
      
      const stream = this.healthClient.watchHealth(req, metadata);
      
      stream.on('data', (msg: healthPb.WatchHealthResponse) => {
        console.log(`Received health data for ${serviceId}:`, msg.toObject());
        if (onUpdate) {
          onUpdate(msg.toObject());
        }
      });
      
      stream.on('error', (err: grpcWeb.RpcError) => {
        console.error(`Health stream error for ${serviceId}:`, {
          code: err.code,
          message: err.message,
          metadata: err.metadata
        });
        if (onError) {
          onError(err);
        }
      });
      
      stream.on('end', () => {
        console.log(`Health stream ended for service: ${serviceId}`);
      });
      
      stream.on('status', (status) => {
        console.log(`Health stream status for ${serviceId}:`, status);
      });
      
      console.log(`Health stream started for service: ${serviceId}`);
      return stream;
    } catch (error) {
      if (onError) {
        onError(error as grpcWeb.RpcError);
      }
      return undefined;
    }
  }
}

// Singleton export
export const backendService = new BackendService();