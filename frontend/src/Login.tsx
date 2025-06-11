const Login = () => {
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("uname") as string;
    const password = formData.get("psw") as string;

    await handleLogin(username, password);
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

async function handleLogin(username: string, password: string): Promise<void> {
  try {
    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: { username }, password: { password } }),
    });

    const data = await response.json();

    if (response.ok) {
      // Save the JWT for future use
      //   localStorage.setItem("token", data.token);
      console.log("Token: " + data.token);
    } else {
      console.error("Login failed:", data.message);
    }
  } catch (error) {
    console.error("Network or server error:", error);
  }
}

export default Login;
