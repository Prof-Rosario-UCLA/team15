const Service = ({ name }: { name: string }) => {
  // needs an icon for status
  return <div className="text-center hover:bg-gray-600">Service {name}</div>;
};

export default Service;
