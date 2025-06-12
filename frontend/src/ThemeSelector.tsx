import React, { useState, useEffect } from "react";
import { setTheme } from "./utils/theme";

type Theme = "light" | "dark" | "system";

function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState<Theme>("system");

  useEffect(() => {
    setTheme(selectedTheme);
  }, [selectedTheme]);

  return (
    <form>
      <fieldset>
        <legend>Theme:</legend>
        <div className="flex flex-col">
          <div className="flex items-center">
            <input
              type="radio"
              id="choice1"
              name="userTheme"
              value="light"
              checked={selectedTheme === "light"}
              onChange={() => setSelectedTheme("light")}
            />
            <label htmlFor="choice1">Light</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="choice2"
              name="userTheme"
              value="dark"
              checked={selectedTheme === "dark"}
              onChange={() => setSelectedTheme("dark")}
            />
            <label htmlFor="choice2">Dark</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="choice3"
              name="userTheme"
              value="system"
              checked={selectedTheme === "system"}
              onChange={() => setSelectedTheme("system")}
            />
            <label htmlFor="choice3">System</label>
          </div>
        </div>
      </fieldset>
    </form>
  );
}

export default ThemeSelector;
