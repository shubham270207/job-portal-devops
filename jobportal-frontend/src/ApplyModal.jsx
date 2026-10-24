import { useState, useEffect } from "react";
import api, { getErrorMessage } from "./services/api";

function ApplyModal({ job, isOpen, onClose, onApplied }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    resumeLink: "",
    coverNote: ""
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: localStorage.getItem("name") || "",
        email: localStorage.getItem("email") || "",
        resumeLink: "",
        coverNote: ""
      });
      setErrors({});
      setErrorMessage("");
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const validate = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.name.trim()) {
      errs.name = "Full name is required";
    }

    if (!form.email.trim()) {
      errs.email = "Email is required";
    } else if (!emailRegex.test(form.email.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (form.resumeLink.trim() && !/^https?:\/\/.+/i.test(form.resumeLink.trim())) {
      errs.resumeLink = "Resume link must start with http:// or https://";
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
    setErrorMessage("");

    try {
      const userId = localStorage.getItem("email") || localStorage.getItem("name") || form.email.trim();

      const payload = {
        userId: userId.trim(),
        jobId: job.id,
        jobTitle: job.title,
        jobCompany: job.company,
        applicantName: form.name.trim(),
        applicantEmail: form.email.trim(),
        resumeLink: form.resumeLink.trim(),
        coverNote: form.coverNote.trim(),
        status: "APPLIED",
        applicationDate: new Date().toISOString()
      };

      await api.post("/applications", payload);

      setSubmitted(true);

      if (onApplied) {
        onApplied(job.id);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const msg = getErrorMessage(err, "Failed to submit application");
      setErrorMessage(msg);
      if (msg.toLowerCase().includes("already applied")) {
        setSubmitted(true);
        if (onApplied) onApplied(job.id);
        setTimeout(onClose, 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-badge">{job.company}</span>
            <h3 className="modal-title">Apply for {job.title}</h3>
            <p className="modal-subtitle">
              {job.location} • {job.salary}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {submitted ? (
          <div className="modal-success">
            <div className="modal-success-icon">🎉</div>
            <h4>Application Submitted!</h4>
            <p>Your application was delivered to the hiring team. You can track your review status anytime in My Applications.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="app-name">Your Full Name</label>
              <input
                id="app-name"
                type="text"
                name="name"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="app-email">Your Email</label>
              <input
                id="app-email"
                type="email"
                name="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className={errors.email ? "input-error" : ""}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="app-resume">
                Resume / Portfolio / LinkedIn Link <span style={{ opacity: 0.6 }}>(optional)</span>
              </label>
              <input
                id="app-resume"
                type="url"
                name="resumeLink"
                placeholder="https://linkedin.com/in/... or Google Drive link"
                value={form.resumeLink}
                onChange={handleChange}
                disabled={loading}
                className={errors.resumeLink ? "input-error" : ""}
              />
              {errors.resumeLink && <span className="field-error">{errors.resumeLink}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="app-note">
                Short Note / Why you&apos;re a great fit <span style={{ opacity: 0.6 }}>(optional)</span>
              </label>
              <textarea
                id="app-note"
                name="coverNote"
                rows="3"
                placeholder="Briefly highlight your relevant skills and experience…"
                value={form.coverNote}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {errorMessage && (
              <p className="message message--error" style={{ marginBottom: "16px" }}>
                {errorMessage}
              </p>
            )}

            <div className="modal-actions">
              <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Submitting Application…" : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ApplyModal;
