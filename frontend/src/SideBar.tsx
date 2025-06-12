import React, { useState } from "react";
import ThemeSelector from "./ThemeSelector";
import ServiceComponent from "./Service";
import { useServices } from "./ServicesContext";
import type { ServiceWithHealth } from "./types";

const SideBar = () => {
  const { services, selectedService, setSelectedService, isLoading, error } =
    useServices();

  const [displayedServices, setDisplayedServices] = useState<ServiceWithHealth[]>(
    services
  );

  React.useEffect(() => {
    setDisplayedServices(services);
  }, [services]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    serviceId: string
  ) => {
    e.dataTransfer.setData("text/plain", serviceId);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    targetServiceId: string
  ) => {
    const fromServiceId = e.dataTransfer.getData("text/plain");
    if (fromServiceId === targetServiceId) return;

    const fromIndex = displayedServices.findIndex(
      (s) => s.id === fromServiceId
    );
    const toIndex = displayedServices.findIndex((s) => s.id === targetServiceId);

    if (fromIndex === -1 || toIndex === -1) return;

    const updated = [...displayedServices];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    setDisplayedServices(updated);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Required to allow drop
  };

  if (isLoading) return <div className="p-4">Loading services...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col w-64 m-0 bg-gray-100 dark:bg-gray-900 text-black dark:text-white shadow min-h-screen">
      <h1 className="text-2xl m-5 text-center">Service Catalog</h1>
      <div className="flex-grow overflow-y-auto">
        {displayedServices.map((service) => (
          <div
            key={service.id}
            draggable
            onDragStart={(e) => handleDragStart(e, service.id)}
            onDrop={(e) => handleDrop(e, service.id)}
            onDragOver={handleDragOver}
            className="m-1 border border-transparent hover:border-gray-400 dark:hover:border-gray-600 rounded"
          >
            <ServiceComponent
              name={service.name}
              status={service.health?.status}
              selected={selectedService === service.id}
              onClick={() => setSelectedService(service.id)}
            />
          </div>
        ))}
      </div>
      <div className="mt-auto m-5">
        <ThemeSelector />
      </div>
    </div>
  );
};

export default SideBar;
