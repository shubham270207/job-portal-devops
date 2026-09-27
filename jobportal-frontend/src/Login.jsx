import { useState } from "react";
import api from "./services/api";

function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", form);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.name);
      localStorage.setItem("role", response.data.role);

      setMessage("Login successful!");

      console.log(response.data);

      onLogin();
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data || "Login failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <h2>Job Portal Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password:</label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">
          Login
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Login;