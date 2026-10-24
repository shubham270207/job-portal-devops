import { useState } from "react";
import api, { getErrorMessage } from "./services/api";

function Register({ onRegistered }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER"
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) {
      errs.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      errs.name = "Name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!emailRegex.test(form.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }

    if (!form.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (form.confirmPassword !== form.password) {
      errs.confirmPassword = "Passwords do not match";
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

  const handleRoleSelect = (selectedRole) => {
    setForm((prev) => ({
      ...prev,
      role: selectedRole
    }));
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
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role
      };

      await api.post("/auth/register", payload);

      setMessage("Registration successful! You can now sign in.");
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "USER"
      });

      if (onRegistered) {
        setTimeout(onRegistered, 1500);
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create account</h2>
      <p className="auth-subtitle">Get started by creating your account</p>

      {/* Role Picker Segment */}
      <div className="role-selector-group">
        <label>I want to:</label>
        <div className="role-selector">
          <button
            type="button"
            className={`role-option-btn ${form.role === "USER" ? "role-option-btn--active" : ""}`}
            onClick={() => handleRoleSelect("USER")}
          >
            <span className="role-icon">💼</span>
            <div>
              <div className="role-title">Find a Job</div>
              <div className="role-desc">Candidate</div>
            </div>
          </button>

          <button
            type="button"
            className={`role-option-btn ${form.role === "ADMIN" ? "role-option-btn--active" : ""}`}
            onClick={() => handleRoleSelect("ADMIN")}
          >
            <span className="role-icon">🏢</span>
            <div>
              <div className="role-title">Hire Talent</div>
              <div className="role-desc">Admin / Recruiter</div>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
            className={errors.name ? "input-error" : ""}
          />
          {errors.name && (
            <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
              {errors.name}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
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
          <label htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            name="password"
            placeholder="Choose a password (min 6 chars)"
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

        <div className="form-group">
          <label htmlFor="reg-confirm-password">Confirm Password</label>
          <input
            id="reg-confirm-password"
            type="password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            className={errors.confirmPassword ? "input-error" : ""}
          />
          {errors.confirmPassword && (
            <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      {message && (
        <p className={`message ${message.toLowerCase().includes("successful") ? "message--success" : "message--error"}`} style={{ marginTop: "16px" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default Register;