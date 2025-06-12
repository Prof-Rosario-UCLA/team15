import React from "react";
import SideBar from "./SideBar";
import Login from "./Login";
import ServiceDisplay from "./ServiceDisplay";
import { useAuth } from "./AuthContext";
import { useServices } from "./ServicesContext";

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { services, selectedService, setSelectedService } = useServices();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Operations Dashboard
          </h1>
          <Login />
        </div>
      </div>
    );
  }

  const allOperational = services.every(
    service => service.health?.status === "STATUS_UP"
  );

  return (
    <div className="flex flex-col min-h-screen max-h-screen">
      <header className="bg-white dark:bg-gray-800 text-center">
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

      <main className="flex flex-1 overflow-y-auto">
        <SideBar
          selectedService={selectedService}
          onSelectService={setSelectedService}
        />
        <ServiceDisplay currentService={selectedService} />
      </main>
    </div>
  );
};

export default Dashboard;
