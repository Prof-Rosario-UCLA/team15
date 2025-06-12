// src/services/BackendService.ts
import * as grpcWeb from 'grpc-web';
// Import the generated gRPC client files using the npm packages
import * as healthGrpc from '../gen/ts/proto/health/v1/HealthServiceClientPb';
import * as catalogGrpc from '../gen/ts/proto/catalog/v1/CatalogServiceClientPb';
import * as healthPb from '../gen/ts/proto/health/v1/health_pb';
import * as catalogPb from '../gen/ts/proto/catalog/v1/catalog_pb';

// Types for the service objects
interface ServiceObject {
  [key: string]: any; // Adjust based on your actual service proto structure
}

interface HealthObject {
  [key: string]: any; // Adjust based on your actual health proto structure
}

// Type for stream handlers
type HealthUpdateHandler = (health: HealthObject) => void;
type ErrorHandler = (error: grpcWeb.RpcError) => void;

export class BackendService {
  private baseUrl: string;
  private healthClient: healthGrpc.HealthServiceClient;
  private catalogClient: catalogGrpc.CatalogServiceClient;

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
    this.healthClient = new healthGrpc.HealthServiceClient(this.baseUrl);
    this.catalogClient = new catalogGrpc.CatalogServiceClient(this.baseUrl);
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
  fetchServices(): Promise<ServiceObject[]> {
    return new Promise((resolve, reject) => {
      try {
        const req = new catalogPb.ListServicesRequest();
        const stream = this.catalogClient.listServices(req, this.createMetadata());
        const result: ServiceObject[] = [];
        
        stream.on('data', (msg) => {
          msg.getServicesList().forEach(s => result.push(s.toObject()));
        });
        
        stream.on('end', () => resolve(result));
        stream.on('error', (err: grpcWeb.RpcError) => reject(err));
      } catch (error) {
        reject(error);
      }
    });
  }

  // Stream watchHealth()
  watchServiceHealth(
    serviceId: string, 
    onUpdate?: HealthUpdateHandler, 
    onError?: ErrorHandler
  ): grpcWeb.ClientReadableStream<any> | undefined {
    try {
      const req = new healthPb.WatchHealthRequest();
      req.setServiceId(serviceId);
      const stream = this.healthClient.watchHealth(req, this.createMetadata());
      
      stream.on('data', (msg) => {
        if (onUpdate) {
          onUpdate(msg.toObject());
        }
      });
      
      stream.on('error', (err: grpcWeb.RpcError) => {
        if (onError) {
          onError(err);
        }
      });
      
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