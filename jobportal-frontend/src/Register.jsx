import { useState } from "react";
import api from "./services/api";

function Register() {
  const [form, setForm] = useState({
    name: "",
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
      const response = await api.post("/auth/register", form);

      setMessage("Registration successful!");
      console.log(response.data);

      setForm({
        name: "",
        email: "",
        password: ""
      });
    } catch (error) {
      console.log(error);
      setMessage(
        error.response?.data || "Registration failed"
      );
    }
  };

  return (
    <div className="auth-container">
      <h2>Job Portal Registration</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Email: </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Password: </label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <button type="submit">Register</button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default Register;