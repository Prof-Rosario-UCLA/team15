// src/services/BackendService.js

import * as grpcWeb from 'grpc-web';

// Import the generated gRPC client files using the npm packages
import * as healthGrpc from '../../gen/proto/health/v1/health_grpc_web_pb.js';
import * as catalogGrpc from '../../gen/proto/catalog/v1/catalog_grpc_web_pb.js';
import * as healthPb from '../../gen/proto/health/v1/health_pb.js';
import * as catalogPb from '../../gen/proto/catalog/v1/catalog_pb.js';

export class BackendService {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
    this.healthClient = new healthGrpc.HealthServiceClient(this.baseUrl);
    this.catalogClient = new catalogGrpc.CatalogServiceClient(this.baseUrl);
  }

  // REST login; JWT stored in HttpOnly cookie automatically
  async login(username, password) {
    try {
      const resp = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      return resp.ok;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  // gRPC calls will automatically include cookies
  createMetadata() {
    // Browser automatically includes cookies with gRPC-Web requests
    // No manual auth headers needed anymore!
    return {};
  }

  // Stream listServices()
  fetchServices() {
    return new Promise((resolve, reject) => {
      try {
        const req = new catalogPb.ListServicesRequest();
        const stream = this.catalogClient.listServices(req, this.createMetadata());
        const result = [];

        stream.on('data', (msg) => {
          msg.getServicesList().forEach(s => result.push(s.toObject()));
        });
        
        stream.on('end', () => resolve(result));
        stream.on('error', (err) => reject(err));
      } catch (error) {
        reject(error);
      }
    });
  }

  // Stream watchHealth()
  watchServiceHealth(serviceId, onUpdate, onError) {
    try {
      const req = new healthPb.WatchHealthRequest();
      req.setServiceId(serviceId);

      const stream = this.healthClient.watchHealth(req, this.createMetadata());
      
      stream.on('data', (msg) => {
        if (onUpdate) {
          onUpdate(msg.toObject());
        }
      });
      
      stream.on('error', (err) => {
        if (onError) {
          onError(err);
        }
      });
      
      return stream;
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  }
}

// Singleton export
export const backendService = new BackendService();
