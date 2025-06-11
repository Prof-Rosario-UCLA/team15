const Login = () => {
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("uname") as string;
    const password = formData.get("psw") as string;

    const success = await handleLogin(username, password);

    // todo: lift state up to App.tsx so you only display the currently selected Service
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

async function handleLogin(uname: string, psw: string): Promise<boolean> {
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