import "./App.css";
import SideBar from "./SideBar";
import Login from "./Login";
import ServiceDisplay from "./ServiceDisplay";
import { useState } from "react";

type ServiceStatus = "working" | "partial" | "down";

function App() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const services = [
    { name: "WebMVC", status: "working" as ServiceStatus },
    { name: "Ordering", status: "partial" as ServiceStatus },
    { name: "Catalog", status: "down" as ServiceStatus },
  ];
  const allOperational = services.every(
    (service) => service.status === "working"
  );
  return (
    <div className="flex flex-col min-h-screen">
      {/* todo: move title into its own component */}
      <header className="bg-amber-100 dark:bg-gray-800 text-center">
        <h1 className="text-4xl font-bold tracking-wide text-gray-900 dark:text-white sm:text-5xl md:text-6xl p-2">
          Operations Status
        </h1>
        <h2
          className={`text-white sm:text-1xl md:text-3xl p-2 rounded-lg inline-block m-2 px-6 ${
            allOperational ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {allOperational ? "All Systems Operational" : "Some Systems Down"}
        </h2>
      </header>

      <main className="flex flex-1">
        <SideBar
          selectedService={selectedService}
          onSelectService={setSelectedService}
          services={services}
        />
        {/* todo: all systems operational check */}
        {/* <Login /> */}
        <ServiceDisplay currentService={selectedService} />
      </main>
    </div>
  );
}

export default App;
