import ThemeSelector from "./ThemeSelector.jsx";
import Service from "./Service.jsx";

const SideBar = () => {
  return (
    <div className="flex flex-col w-40 m-0 bg-gray-900 text-white shadow">
      <h1 className="text-2xl m-10">Service Catalog</h1>
      {/* todo: add search bar */}
      <Service name={"A"} />
      <Service name={"B"} />
      <Service name={"C"} />
      <ThemeSelector />
    </div>
  );
};

export default SideBar;
