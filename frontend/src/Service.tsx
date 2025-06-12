import React from "react";
import type { ServiceStatus } from "./types"; // Import the enum type
import { getStatusColor } from "./types"; // Import utility functions

type ServiceProps = {
  name: string;
  status?: ServiceStatus; // Make status optional as it might not be immediately available
  selected?: boolean;
  onClick?: () => void;
};

const Service = ({ name, status, selected, onClick }: ServiceProps) => {
  const base = "cursor-pointer text-center text-lg px-4 py-2";
  const selectedStyle = selected ? "font-bold" : "font-normal";

  // Use getStatusColor for the dot, and mapStatusToLegacy for any legacy text if needed
  // For now, let's assume the dot color is the primary concern.
  // The old logic used 'working', 'partial', 'down'. We need to map the new enum status.
  const statusColorClass = status !== undefined ? getStatusColor(status) : 'bg-gray-400'; // Default if status is undefined

  return (
    <div className="flex justify-between items-center p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
      <div
        className={`w-3 h-3 rounded-full ${statusColorClass}`}
      ></div>
      <div className={`${base} ${selectedStyle}`} onClick={onClick}>
        {name}
      </div>
    </div>
  );
};

export default Service;
