import React from "react";
import { backendService } from "./BackendService";

const Login = () => {
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("uname") as string;
    const password = formData.get("psw") as string;

    const success = await backendService.login(username, password);

    if (success) {
      console.log("Login successful");
      try {
        const services = await backendService.fetchServices();
        console.log("Services:", services);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      }
    } else {
      console.log("Login failed");
    }
  };
  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="uname">Username</label>
      <input type="text" placeholder="Enter Username" name="uname" required />
      <label htmlFor="psw">Password</label>
      <input type="password" placeholder="Enter Password" name="psw" required />

      <button type="submit">Log In</button>
      {/* todo: remember me check */}
    </form>
  );
};

export default Login;