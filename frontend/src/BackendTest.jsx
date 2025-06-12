import React, { useState, useEffect } from 'react';
import { backendService } from './services/BackendService.js';

export const BackendTest = () => {
  const [loginStatus, setLoginStatus] = useState('Not logged in');
  const [services, setServices] = useState([]);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [error, setError] = useState('');

  // Test login
  const testLogin = async () => {
    try {
      setError('');
      setLoginStatus('Logging in...');
      const success = await backendService.login('admin', 'secret');
      if (success) {
        setLoginStatus('✅ Login successful!');
      } else {
        setLoginStatus('❌ Login failed');
      }
    } catch (err) {
      setError(`Login error: ${err}`);
      setLoginStatus('❌ Login error');
    }
  };

  // Test fetching services
  const fetchServices = async () => {
    try {
      setError('');
      const serviceList = await backendService.fetchServices();
      setServices(serviceList);
      console.log('Fetched services:', serviceList);
    } catch (err) {
      setError(`Services fetch error: ${err}`);
      console.error('Services fetch error:', err);
    }
  };

  // Test health monitoring
  const watchHealth = (serviceId) => {
    if (!serviceId) return;
    
    setSelectedServiceId(serviceId);
    setHealthMetrics([]);
    
    backendService.watchServiceHealth(
      serviceId,
      (metric) => {
        console.log('Health update:', metric);
        setHealthMetrics(prev => [...prev, metric]);
      },
      (error) => {
        console.error('Health watch error:', error);
        setError(`Health watch error: ${error.message}`);
      }
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Backend Service Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Login Test */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">1. Authentication Test</h2>
        <div className="flex gap-4 items-center">
          <button
            onClick={testLogin}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Test Login
          </button>
          <span className="text-sm">{loginStatus}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Credentials: admin / secret
        </p>
      </div>

      {/* Services Test */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">2. Services Catalog Test</h2>
        <button
          onClick={fetchServices}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Fetch Services
        </button>
        
        {services.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Services ({services.length}):</h3>
            <div className="grid gap-2">
              {services.map((service) => (
                <div key={service.id} className="border border-gray-200 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{service.name}</strong> (ID: {service.id})
                      <br />
                      <span className="text-sm text-gray-600">
                        Owner: {service.owner} | Version: {service.version}
                      </span>
                      {service.protoUrl && (
                        <>
                          <br />
                          <span className="text-xs text-blue-600">
                            Proto: {service.protoUrl}
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => watchHealth(service.id)}
                      className="bg-purple-500 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded"
                    >
                      Watch Health
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Health Monitoring Test */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">3. Health Monitoring Test</h2>
        {selectedServiceId && (
          <p className="text-sm text-gray-600 mb-2">
            Watching health for service: <strong>{selectedServiceId}</strong>
          </p>
        )}
        
        {healthMetrics.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Health Metrics ({healthMetrics.length}):</h3>
            <div className="max-h-64 overflow-y-auto">
              {healthMetrics.map((metric, index) => (
                <div key={index} className="border border-gray-200 p-2 rounded mb-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status: <strong>{metric.status === 1 ? '🟢 UP' : '🔴 DOWN'}</strong></span>
                    <span>Latency: {metric.latencyMs}ms</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Error Rate: {(metric.errorRate * 100).toFixed(1)}%</span>
                    <span>{new Date(metric.timestampMs).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h3 className="font-medium mb-2">Debug Information:</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Backend URL: http://localhost:8080</div>
          <div>Login Endpoint: /login (HTTP POST)</div>
          <div>gRPC Services: CatalogService, HealthService</div>
          <div>Generated gRPC-Web stubs: ✅ Available</div>
        </div>
      </div>
    </div>
  );
};
