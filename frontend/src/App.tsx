import React from "react";
import "./App.css";
import SideBar from "./SideBar";
import Login from "./Login";
import ServiceDisplay from "./ServiceDisplay";
import { AuthProvider, useAuth } from "./AuthContext";
import { ServicesProvider, useServices } from "./ServicesContext";
import * as healthPb from "../gen/ts/proto/health/v1/health_pb"; // For Status enum

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <ServicesProvider>
      <DashboardLayout />
    </ServicesProvider>
  );
};

const DashboardLayout = () => {
  const { services, isLoading } = useServices();

  const allOperational = React.useMemo(() => {
    if (isLoading || !services.length) return false;
    return services.every(
      (service) => service.health?.status === healthPb.Status.STATUS_UP
    );
  }, [services, isLoading]);

  const someSystemsDown = React.useMemo(() => {
    if (isLoading || !services.length) return false;
    return services.some(
        (service) => service.health?.status === healthPb.Status.STATUS_DOWN
    );
  }, [services, isLoading]);

  let bannerText = "Checking System Status...";
  let bannerClass = "bg-yellow-500";

  if (!isLoading && services.length > 0) {
    if (allOperational) {
      bannerText = "All Systems Operational";
      bannerClass = "bg-green-600";
    } else if (someSystemsDown) {
      bannerText = "Some Systems Down";
      bannerClass = "bg-red-600";
    } else {
      bannerText = "Some Systems Partial/Unknown";
      bannerClass = "bg-yellow-600";
    }
  } else if (!isLoading && services.length === 0) {
    bannerText = "No Services Loaded";
    bannerClass = "bg-gray-500";
  }

  return (
    <div className="flex flex-col min-h-screen max-h-screen">
      <header className="bg-white dark:bg-gray-800 text-center py-4 shadow-md">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Operations Status
        </h1>
        <h2
          className={`text-white text-xl sm:text-2xl md:text-3xl p-3 rounded-lg inline-block mt-3 mx-auto px-6 shadow ${
            bannerClass
          }`}
        >
          {bannerText}
        </h2>
      </header>

      <main className="flex flex-1 overflow-y-auto">
        <SideBar />
        <ServiceDisplay />
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
