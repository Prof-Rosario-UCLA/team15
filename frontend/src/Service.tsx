type ServiceStatus = "working" | "partial" | "down";

type ServiceProps = {
  name: string;
  status: ServiceStatus;
  selected?: boolean;
  onClick?: () => void;
};

const Service = ({ name, status, selected, onClick }: ServiceProps) => {
  const base = "cursor-pointer text-center text-lg px-4 py-2";
  const selectedStyle = selected ? "font-bold" : "font-normal";

  return (
    <div className="flex justify-between items-center p-2 bg-gray-900 hover:bg-gray-700">
      <div
        className={`w-3 h-3 rounded-full ${
          status === "working"
            ? "bg-green-500"
            : status === "partial"
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
      ></div>
      <div className={`${base} ${selectedStyle}`} onClick={onClick}>
        {name}
      </div>
    </div>
  );
};

export default Service;
