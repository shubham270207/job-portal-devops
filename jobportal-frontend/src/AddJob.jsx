import { useState } from "react";
import api, { getErrorMessage } from "./services/api";

function AddJob({ onJobAdded }) {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    skills: "",
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const validate = () => {
    const errs = {};

    if (!form.title.trim()) {
      errs.title = "Job title is required";
    } else if (form.title.trim().length < 3) {
      errs.title = "Job title must be at least 3 characters";
    }

    if (!form.company.trim()) {
      errs.company = "Company name is required";
    }

    if (!form.location.trim()) {
      errs.location = "Location is required";
    }

    if (!form.salary.trim()) {
      errs.salary = "Salary is required";
    }

    if (!form.skills.trim()) {
      errs.skills = "Required skills are needed (e.g. React, Java)";
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
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        salary: form.salary.trim(),
        skills: form.skills.trim(),
        description: form.description.trim()
      };

      await api.post("/jobs", payload);

      setMessage("Job published successfully!");

      setForm({
        title: "",
        company: "",
        location: "",
        salary: "",
        skills: "",
        description: ""
      });

      if (onJobAdded) {
        onJobAdded();
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Failed to publish job"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-job-card">
      <h2>Add New Job</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="add-job-grid">
          <div className="form-group">
            <label htmlFor="job-title">Job Title</label>
            <input
              id="job-title"
              type="text"
              name="title"
              placeholder="e.g. Senior Frontend Engineer"
              value={form.title}
              onChange={handleChange}
              disabled={loading}
              className={errors.title ? "input-error" : ""}
            />
            {errors.title && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="job-company">Company</label>
            <input
              id="job-company"
              type="text"
              name="company"
              placeholder="e.g. Acme Corp"
              value={form.company}
              onChange={handleChange}
              disabled={loading}
              className={errors.company ? "input-error" : ""}
            />
            {errors.company && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                {errors.company}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="job-location">Location</label>
            <input
              id="job-location"
              type="text"
              name="location"
              placeholder="e.g. Remote, New York, NY"
              value={form.location}
              onChange={handleChange}
              disabled={loading}
              className={errors.location ? "input-error" : ""}
            />
            {errors.location && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                {errors.location}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="job-salary">Salary</label>
            <input
              id="job-salary"
              type="text"
              name="salary"
              placeholder="e.g. $120k – $160k"
              value={form.salary}
              onChange={handleChange}
              disabled={loading}
              className={errors.salary ? "input-error" : ""}
            />
            {errors.salary && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                {errors.salary}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="job-skills">Skills</label>
          <input
            id="job-skills"
            type="text"
            name="skills"
            placeholder="e.g. React, TypeScript, Node.js"
            value={form.skills}
            onChange={handleChange}
            disabled={loading}
            className={errors.skills ? "input-error" : ""}
          />
          {errors.skills && (
            <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
              {errors.skills}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="job-desc">Description</label>
          <textarea
            id="job-desc"
            name="description"
            placeholder="Describe the role, responsibilities, and requirements…"
            value={form.description}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Publishing Job…" : "Publish Job"}
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

export default AddJob;