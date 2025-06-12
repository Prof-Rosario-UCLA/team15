import { backendService } from "./services/BackendService.js";

const Login = () => {
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("uname");
    const password = formData.get("psw");

    const success = await handleLogin(username, password);

    console.log(backendService.fetchServices());
    console.log("Hello World");

    // todo: lift state up to App.jsx so you only display the currently selected Service
    // if (success) {
    //   fetchServices();
    // } else {
    //   console.log("Login failed");
    // }
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

async function handleLogin(uname, psw) {
  try {
    const params = new URLSearchParams({
      Key: uname,
      Value: psw,
    });
    // console.log(`http://localhost:8080/login?${params.toString()}`);
    const response = await fetch(
      `http://localhost:8080/login?${params.toString()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: uname, password: psw }),
        credentials: "include",
      }
    );

    const text = await response.text(); // Consume the body once
    console.log(text);
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Network or server error:", error);
    return false;
  }
}

export default Login;
