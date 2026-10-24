import { useState } from "react";
import api, { getErrorMessage } from "./services/api";

function Login({ onLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [selectedRole, setSelectedRole] = useState("USER");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!emailRegex.test(form.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!form.password) {
      errs.password = "Password is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: selectedRole
      };

      const response = await api.post("/auth/login", payload);

      const effectiveRole = response.data.role || selectedRole;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.name || form.email.split("@")[0]);
      localStorage.setItem("email", response.data.email || form.email.trim());
      localStorage.setItem("role", effectiveRole);
      if (response.data.userId) {
        localStorage.setItem("userId", response.data.userId);
      }

      setMessage("Login successful!");
      if (onLogin) {
        onLogin(effectiveRole);
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign in</h2>
      <p className="auth-subtitle">Enter your credentials to access your account</p>

      {/* Role Picker Segment */}
      <div className="role-selector-group">
        <label>Sign in as:</label>
        <div className="role-selector">
          <button
            type="button"
            className={`role-option-btn ${selectedRole === "USER" ? "role-option-btn--active" : ""}`}
            onClick={() => setSelectedRole("USER")}
          >
            <span className="role-icon">💼</span>
            <div>
              <div className="role-title">Job Seeker</div>
              <div className="role-desc">Candidate Portal</div>
            </div>
          </button>

          <button
            type="button"
            className={`role-option-btn ${selectedRole === "ADMIN" ? "role-option-btn--active" : ""}`}
            onClick={() => setSelectedRole("ADMIN")}
          >
            <span className="role-icon">🏢</span>
            <div>
              <div className="role-title">Employer</div>
              <div className="role-desc">Admin Portal</div>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && (
            <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
              {errors.email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && (
            <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
              {errors.password}
            </span>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {message && (
        <p className={`message ${message.toLowerCase().includes("success") ? "message--success" : "message--error"}`} style={{ marginTop: "16px" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Login;