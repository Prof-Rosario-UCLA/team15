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
  services,
}: SideBarProps) => {
  return (
    <div className="flex flex-col w-40 m-0 bg-gray-900 text-white shadow">
      <h1 className="text-2xl m-5 text-center">Service Catalog</h1>
      {/* todo: add search bar */}
      {services.map(({ name, status }) => (
        <Service
          key={name}
          name={name}
          status={status}
          selected={selectedService === name}
          onClick={() => onSelectService(name)}
        />
      ))}
      <div className="mt-auto m-5">
        <ThemeSelector />
      </div>
    </div>
  );
};

export default SideBar;
