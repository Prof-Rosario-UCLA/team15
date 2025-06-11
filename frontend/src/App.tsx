import "./App.css";
import { setTheme } from "./utils/theme";

function App() {
  return (
    <div>
      <header className="bg-amber-100 dark:bg-gray-800">
        <h1 className="text-4xl font-bold tracking-wide text-gray-900 dark:text-white sm:text-5xl md:text-6xl p-6 text-center">
          Operations Status
        </h1>
      </header>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 m-8 rounded"
        onClick={() => {
          setTheme("light");
        }}
      >
        Light
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 m-8 rounded"
        onClick={() => {
          setTheme("dark");
        }}
      >
        Dark
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 m-8 rounded"
        onClick={() => {
          setTheme("system");
        }}
      >
        System
      </button>
    </div>
  );
}

export default App;
