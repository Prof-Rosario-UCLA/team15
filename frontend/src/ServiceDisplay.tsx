import React from "react";
import { useServices } from "./ServicesContext";
import { getStatusText, getStatusColor } from "./types";

const ServiceDisplay = () => {
  const { services, selectedService, isLoading } = useServices();

  React.useEffect(() => {
    const currentService = services.find((s) => s.id === selectedService);
    if (selectedService) {
      console.log(
        `[ServiceDisplay] Selected Service: ${selectedService}. Health data:`,
        currentService?.health
      );
    }
  }, [services, selectedService]);

  if (isLoading && !services.length) {
    return (
      <div className="w-full p-6 bg-white dark:bg-gray-900 text-gray-500 dark:text-white">
        Loading service details...
      </div>
    );
  }

  const currentServiceDetails = services.find((s) => s.id === selectedService);

  if (!currentServiceDetails) {
    return (
      <div className="w-full p-6 bg-white dark:bg-gray-900 text-gray-500 dark:text-white">
        {selectedService
          ? `Details for ${selectedService} not found.`
          : "Select a service to view details."}
      </div>
    );
  }

  const {
    id,
    name,
    owner,
    version,
    protoUrl,
    health,
  } = currentServiceDetails;

  const statusText = health ? getStatusText(health.status) : "Unknown";
  const statusColor = health ? getStatusColor(health.status) : "bg-gray-400";
  const lastLatency = health ? health.latencyMs : "N/A";
  const lastErrorRate = health
    ? (health.errorRate * 100).toFixed(1) + "%"
    : "N/A";

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-900 overflow-y-auto min-h-screen">
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-white">
        <h2 className="text-3xl font-semibold mb-2">{name}</h2>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-1">
          ID: {id}
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-1">
          Owner: {owner}
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-4">
          Version: {version}
        </p>
        {protoUrl && (
          <p className="text-md text-gray-600 dark:text-gray-400 mb-4">
            Proto:{" "}
            <a
              href={protoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {protoUrl}
            </a>
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div
            className={`border rounded p-4 text-center ${statusColor.replace(
              "bg-",
              "border-"
            )}`}
          >
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Current Status
            </div>
            <div
              className={`text-xl font-bold ${
                statusColor.includes("yellow")
                  ? "text-yellow-700 dark:text-yellow-300"
                  : statusColor.includes("red")
                  ? "text-red-700 dark:text-red-300"
                  : statusColor.includes("green")
                  ? "text-green-700 dark:text-green-300"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {statusText}
            </div>
          </div>

          <div className="border rounded p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Last Latency
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {lastLatency}
              {typeof lastLatency === "number" ? " ms" : ""}
            </div>
          </div>

          <div className="border rounded p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Last Error Rate
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {lastErrorRate}
            </div>
          </div>

          {/* Placeholder for average metrics if historical data becomes available */}
          <div className="border rounded p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Uptime (Placeholder)
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              N/A
            </div>
          </div>
        </div>

        {/* Charting section removed as historical data is not currently part of HealthData */}
        {health && (
          <div className="mt-6 p-4 border rounded bg-white dark:bg-gray-800 shadow">
            <h3 className="text-xl font-semibold mb-3">Current Health Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <p>
                <strong>Service ID:</strong> {health.serviceId}
              </p>
              <p>
                <strong>Status:</strong> {getStatusText(health.status)}
              </p>
              <p>
                <strong>Latency:</strong> {health.latencyMs} ms
              </p>
              <p>
                <strong>Error Rate:</strong> {(health.errorRate * 100).toFixed(2)}%
              </p>
              <p>
                <strong>Timestamp:</strong>{" "}
                {new Date(health.timestampMs).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {!health && selectedService && (
          <div className="mt-6 p-4 border rounded bg-white dark:bg-gray-800 shadow">
            <h3 className="text-xl font-semibold mb-3">Health Data</h3>
            <p>No current health data available for this service.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDisplay;
