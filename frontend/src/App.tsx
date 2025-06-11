import "./App.css";
import SideBar from "./SideBar";
import Login from "./Login";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* todo: move title into its own component */}
      <header className="bg-amber-100 dark:bg-gray-800">
        <h1 className="text-4xl font-bold tracking-wide text-gray-900 dark:text-white sm:text-5xl md:text-6xl p-6 text-center">
          Operations Status
        </h1>
      </header>

      <main className="flex flex-1">
        <SideBar />
				{/* todo: all systems operational check */}
				<Login />
      </main>
    </div>
  );
}

export default App;
