import React from "react";

type ServiceDisplayProps = {
  currentService?: string | null;
};

const services = [
  {
    id: "WebMVC",
    name: "WebMVC",
    owner: "TeamA",
    version: "v1.0.0",
    protourl: "http://example.com/proto/webmvc.proto",
    status: "STATUS_UP",
    timestamps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    latencies: [30, 20, 25, 22, 28, 18, 26, 21, 24, 15, 10],
    errorRates: [
      0.02, 0.15, 0.08, 0.0, 0.25, 0.1, 0.04, 0.12, 0.06, 0.18, 0.01,
    ],
  },
  {
    id: "Ordering",
    name: "Ordering",
    owner: "TeamB",
    version: "v2.0.0",
    protourl: "http://example.com/protos/ordering.proto",
    status: "STATUS_PARTIAL",
    timestamps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    latencies: [35, 40, 38, 45, 30, 28, 50, 42, 37, 33, 31],
    errorRates: [0.12, 0.22, 0.15, 0.3, 0.18, 0.09, 0.14, 0.2, 0.25, 0.17, 0.1],
  },
  {
    id: "Catalog",
    name: "Catalog",
    owner: "TeamC",
    version: "v1.5.0",
    protourl: "http://example.com/protos/catalog.proto",
    status: "STATUS_DOWN",
    timestamps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    latencies: [50, 60, 55, 52, 58, 63, 70, 68, 66, 72, 75],
    errorRates: [0.4, 0.5, 0.35, 0.45, 0.6, 0.55, 0.48, 0.52, 0.46, 0.49, 0.5],
  },
];

const ServiceDisplay = ({ currentService }: ServiceDisplayProps) => {
  const selectedService = services.find(
    (service) => service.name === currentService
  );

  if (!selectedService) {
    return (
      <div className="p-6 text-gray-500">Select a service to view details.</div>
    );
  }

  const {
    id,
    name,
    owner,
    version,
    status,
    latencies,
    errorRates,
    timestamps,
  } = selectedService;
  const lastLatency = latencies[latencies.length - 1];
  const lastErrorRate = errorRates[errorRates.length - 1];

  // 0->90, 100->15
  const normalize = (x: number) => 90 - (x / 100) * (90 - 15);

  const latencyPoints = timestamps
    .map((t, i) => `${(t / 100) * 100},${normalize(latencies[i]).toFixed(2)}`)
    .join(" ");
  const errorPoints = timestamps
    .map((t, i) => `${(t / 100) * 100},${normalize(errorRates[i]).toFixed(2)}`)
    .join(" ");

  return (
    <div className="w-full bg-gray-100 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 bg-gray-100 text-gray-800">
        <h2 className="text-2xl font-semibold m-2">Service: {name}</h2>
        <h3 className="text-1xl m-2">ID: {id}</h3>
        <h3 className="text-1xl m-2">Owner: {owner}</h3>
        <h3 className="text-1xl m-2">Version: {version}</h3>
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="border rounded p-4 text-center">
            <div className="text-sm text-gray-600">Current Status</div>
            <div className="text-xl font-bold">
              {status.replace("STATUS_", "")}
            </div>
          </div>

          <div className="border rounded p-4 text-center">
            <div className="text-sm text-gray-600">Last Latency</div>
            <div className="text-xl font-bold">{lastLatency} ms</div>
          </div>

          <div className="border rounded p-4 text-center">
            <div className="text-sm text-gray-600">Average Latency</div>
            <div className="text-xl font-bold">
              {(
                latencies.reduce((sum, val) => sum + val, 0) / latencies.length
              ).toFixed(2)}{" "}
              ms
            </div>
          </div>

          <div className="border rounded p-4 text-center">
            <div className="text-sm text-gray-600">Last Error Rate</div>
            <div className="text-xl font-bold">
              {(lastErrorRate * 100).toFixed(1)}%
            </div>
          </div>

          <div className="border rounded p-4 text-center">
            <div className="text-sm text-gray-600">Average Error Rate</div>
            <div className="text-xl font-bold">
              {(
                errorRates.reduce((sum, val) => sum + val, 0) /
                errorRates.length
              ).toFixed(2)}{" "}
              %
            </div>
          </div>
        </div>

        <div className="border rounded p-4 h-94 flex items-end justify-between bg-white">
          <div className="h-full w-full relative">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full"
            >
              {/* Graph Title */}
              <text
                x="50"
                y="10"
                fontSize="5"
                fill="#374151"
                textAnchor="middle"
                fontWeight="bold"
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
                points={latencyPoints}
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDisplay;
