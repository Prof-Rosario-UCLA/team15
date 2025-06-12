import { useState } from "react";
import ThemeSelector from "./ThemeSelector";
import Service from "./Service";

type ServiceStatus = "working" | "partial" | "down";

type ServiceInfo = {
  name: string;
  status: ServiceStatus;
};

type SideBarProps = {
  selectedService: string | null;
  onSelectService: (name: string) => void;
  services: ServiceInfo[];
};

const SideBar = ({
  selectedService,
  onSelectService,
  services: initialServices,
}: SideBarProps) => {
  const [services, setServices] = useState<ServiceInfo[]>(initialServices);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (fromIndex === index) return;

    const updated = [...services];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(index, 0, movedItem);
    setServices(updated);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Required to allow drop
  };

  return (
    <div className="flex flex-col w-40 m-0 bg-gray-100 dark:bg-gray-900 text-black dark:text-white shadow">
      <h1 className="text-2xl m-5 text-center">Service Catalog</h1>
      {services.map(({ name, status }, index) => (
        <div
          key={name}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragOver={handleDragOver}
        >
          <Service
            name={name}
            status={status}
            selected={selectedService === name}
            onClick={() => onSelectService(name)}
          />
        </div>
      ))}
      <div className="mt-auto m-5">
        <ThemeSelector />
      </div>
    </div>
  );
};

export default SideBar;
