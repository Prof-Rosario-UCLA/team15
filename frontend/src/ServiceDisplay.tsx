import React, { useState, useEffect } from "react";
import { useServices } from "./ServicesContext";
import { getStatusText, getStatusColor } from "./types";
const data = [
  {
    name: "WebMVC",
    timestamps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    latencies: [30, 20, 25, 22, 28, 18, 26, 21, 24, 15, 10],
    errorRates: [
      0.02, 0.15, 0.08, 0.0, 0.25, 0.1, 0.04, 0.12, 0.06, 0.18, 0.01,
    ],
  },
  {
    name: "Ordering",
    timestamps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    latencies: [35, 40, 38, 45, 30, 28, 50, 42, 37, 33, 31],
    errorRates: [0.12, 0.22, 0.15, 0.3, 0.18, 0.09, 0.14, 0.2, 0.25, 0.17, 0.1],
  },
  {
    name: "Catalog",
    timestamps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    latencies: [50, 60, 55, 52, 58, 63, 70, 68, 66, 72, 75],
    errorRates: [0.4, 0.5, 0.35, 0.45, 0.6, 0.55, 0.48, 0.52, 0.46, 0.49, 0.5],
  },
];

const ServiceDisplay = () => {
  const { services, selectedService, isLoading } = useServices();
  const [latencies, setLatencies] = useState<number[]>([]);
  const [errorRates, setErrorRates] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [latencyPoints, setLatencyPoints] = useState<string>("");
  const [errorPoints, setErrorPoints] = useState<string>("");
  const normalize = (x: number | "N/A") => {
    if (x === "N/A") {
      // Handle the "N/A" case however you want,
      // for example, return NaN or some default number like 0
      return NaN;
    }
    // x is a number here, so do the calculation
    return 90 - (x / 100) * (90 - 15);
  };

  useEffect(() => {
    const currentService = services.find((s) => s.id === selectedService);
    if (selectedService) {
      console.log(
        `[ServiceDisplay] Selected Service: ${selectedService}. Health data:`,
        currentService?.health
      );
    }

    if (currentService !== undefined) {
      const serviceName = data.find((s) => s.name === currentService.name);
      if (serviceName !== undefined) {
        setLatencies(serviceName.latencies);
        setErrorRates(serviceName.errorRates);
        setTimestamps(serviceName.timestamps);

        setLatencyPoints(
          serviceName.timestamps
            .map((t, i) => {
              return `${t},${normalize(serviceName.latencies[i]).toFixed(2)}`;
            })
            .join(" ")
        );
        setErrorPoints(
          serviceName.timestamps
            .map((t, i) => {
              return `${t},${normalize(serviceName.errorRates[i] * 100).toFixed(
                2
              )}`;
            })
            .join(" ")
        );
      }
    }
  }, [services, selectedService]);

  //   useEffect(() => {
  //     console.log(latencyPoints);
  //   }, [latencyPoints]);

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

  const { id, name, owner, version, protoUrl, health } = currentServiceDetails;

  const statusText = health ? getStatusText(health.status) : "Unknown";
  const statusColor = health ? getStatusColor(health.status) : "bg-gray-400";
  const lastLatency = health ? health.latencyMs : "N/A";
  const lastErrorRate = health
    ? (health.errorRate * 100).toFixed(1) + "%"
    : "N/A";
  const latencyString = latencyPoints.replace(
    /[^ ]+$/,
    "100," + normalize(lastLatency).toFixed(2)
  );
  //   console.log("latency string: " + latencyString);
  const errorString = errorPoints.replace(
    /[^ ]+$/,
    "100," + (health ? normalize(health.errorRate * 100) : "N/A")
  );
  //   console.log("Error String: " + errorString);

  return (
    <div className="w-full bg-gray-100 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-white">
        <h2 className="text-3xl font-semibold mb-2">{name}</h2>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-1">
          ID: {id}
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-1">
          Owner: {owner}
        </p>
        <p className="text-md text-gray-600 dark:text-gray-400 mb-1">
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
              className={`text-md font-bold ${
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
              Average Latency
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {(
                latencies.reduce((sum, val) => sum + val, 0) / latencies.length
              ).toFixed(2)}{" "}
              ms
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

          <div className="border rounded p-4 text-center">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              Average Error Rate
            </div>
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              {(
                (errorRates.reduce((sum, val) => sum + val, 0) /
                  errorRates.length) *
                100
              ).toFixed(2)}{" "}
              %
            </div>
          </div>
        </div>

        {/* Charting section removed as historical data is not currently part of HealthData */}
        {health && (
          <div className="mt-6 p-4 border rounded bg-white dark:bg-gray-800 shadow">
            <h3 className="text-xl font-semibold mb-3">
              Current Health Details
            </h3>
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
                <strong>Error Rate:</strong>{" "}
                {(health.errorRate * 100).toFixed(2)}%
              </p>
              <p>
                <strong>Timestamp:</strong>{" "}
                {new Date(health.timestampMs).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="border rounded p-4 max-w-[600px] flex items-end bg-white dark:bg-gray-900 m-2">
          <div className="h-full w-full relative aspect-[4/3]">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              {/* Graph Title */}
              <text
                x="50"
                y="5"
                fontSize="5"
                fill="#374151"
                textAnchor="middle"
                fontWeight="bold"
                className="dark:fill-white"
              >
                Latency (ms)
              </text>
              {/* Y-axis ticks and labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
                const latencyValue = (100 - 100 * fraction).toFixed(0);
                const y = 15 + 75 * fraction;
                return (
                  <g key={i}>
                    <line
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="0.5"
                    />
                    <text
                      x="-10"
                      y={y}
                      fontSize="2"
                      fill="#9CA3AF"
                      dominantBaseline="middle"
                      className="dark:fill-white"
                    >
                      {latencyValue}ms
                    </text>
                  </g>
                );
              })}

              {/* X-axis line */}
              <line
                x1="0"
                y1="90"
                x2="100"
                y2="90"
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />

              {/* X-axis tick marks and labels */}
              {timestamps.map((timestamp, i) => {
                const maxTimestamp = timestamps[timestamps.length - 1];
                const x = (timestamp / maxTimestamp) * 100;
                return (
                  <g key={i}>
                    {/* Tick line */}
                    <line
                      x1={x}
                      y1="90"
                      x2={x}
                      y2="93"
                      stroke="#9CA3AF"
                      strokeWidth="0.5"
                    />
                    {/* Tick label */}
                    <text
                      x={x}
                      y="98"
                      fontSize="3"
                      fill="#6B7280"
                      textAnchor="middle"
                      className="dark:fill-white"
                    >
                      {timestamp}
                    </text>
                  </g>
                );
              })}

              {/* Polyline for latency */}
              <polyline
                fill="none"
                stroke="#4B5563"
                strokeWidth="1"
                points={latencyString}
                className="dark:stroke-white"
              />
            </svg>
          </div>
        </div>
        <div className="border rounded p-4 max-w-[600px] flex items-end bg-white dark:bg-gray-900 m-2">
          <div className="h-full w-full relative aspect-[4/3]">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              {/* Graph Title */}
              <text
                x="50"
                y="5"
                fontSize="5"
                fill="#374151"
                textAnchor="middle"
                fontWeight="bold"
                className="dark:fill-white"
              >
                Error Rate (%)
              </text>
              {/* Y-axis ticks and labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
                const errorRate = (100 - 100 * fraction).toFixed(0);
                const y = 15 + 75 * fraction;
                return (
                  <g key={i}>
                    <line
                      x1="0"
                      y1={y}
                      x2="100"
                      y2={y}
                      stroke="#E5E7EB"
                      strokeWidth="0.5"
                    />
                    <text
                      x="-10"
                      y={y}
                      fontSize="2"
                      fill="#9CA3AF"
                      dominantBaseline="middle"
                      className="dark:fill-white"
                    >
                      {errorRate}%
                    </text>
                  </g>
                );
              })}

              {/* X-axis line */}
              <line
                x1="0"
                y1="90"
                x2="100"
                y2="90"
                stroke="#E5E7EB"
                strokeWidth="0.5"
              />

              {/* X-axis tick marks and labels */}
              {timestamps.map((timestamp, i) => {
                const maxTimestamp = timestamps[timestamps.length - 1];
                const x = (timestamp / maxTimestamp) * 100;
                return (
                  <g key={i}>
                    {/* Tick line */}
                    <line
                      x1={x}
                      y1="90"
                      x2={x}
                      y2="93"
                      stroke="#9CA3AF"
                      strokeWidth="0.5"
                    />
                    {/* Tick label */}
                    <text
                      x={x}
                      y="98"
                      fontSize="3"
                      fill="#6B7280"
                      textAnchor="middle"
                      className="dark:fill-white"
                    >
                      {timestamp}
                    </text>
                  </g>
                );
              })}

              {/* Polyline for latency */}
              <polyline
                fill="none"
                stroke="#4B5563"
                strokeWidth="1"
                points={errorString}
                className="dark:stroke-white"
              />
            </svg>
          </div>
        </div>

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
