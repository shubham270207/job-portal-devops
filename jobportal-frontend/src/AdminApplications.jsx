import { useEffect, useState } from "react";
import api, { getErrorMessage } from "./services/api";

function AdminApplications({ refreshKey, onStatusUpdated }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Review modal state
  const [activeReviewApp, setActiveReviewApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState("");
  const [adminFeedback, setAdminFeedback] = useState("");
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const loadApplications = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/applications");
      setApplications(response.data || []);
    } catch (error) {
      setMessage(getErrorMessage(error, "Failed to load candidate applications"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [refreshKey]);

  const handleOpenReview = (app, status) => {
    setActiveReviewApp(app);
    setTargetStatus(status);
    setAdminFeedback(app.adminFeedback || (status === "ACCEPTED" ? "Congratulations! Your profile has been shortlisted for next steps." : ""));
  };

  const handleCloseReview = () => {
    setActiveReviewApp(null);
    setTargetStatus("");
    setAdminFeedback("");
  };

  const submitStatusUpdate = async (e) => {
    if (e) e.preventDefault();
    if (!activeReviewApp || !targetStatus) return;

    setSubmittingStatus(true);
    try {
      await api.put(`/applications/${activeReviewApp.id}/status`, {
        status: targetStatus,
        adminFeedback: adminFeedback.trim()
      });

      // Update in-place in local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === activeReviewApp.id
            ? {
                ...app,
                status: targetStatus,
                adminFeedback: adminFeedback.trim(),
                reviewDate: new Date().toISOString()
              }
            : app
        )
      );

      handleCloseReview();
      if (onStatusUpdated) onStatusUpdated();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to update application status"));
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Quick single-click status update without modal
  const quickUpdateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, {
        status: status,
        adminFeedback: ""
      });

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId
            ? {
                ...app,
                status: status,
                reviewDate: new Date().toISOString()
              }
            : app
        )
      );

      if (onStatusUpdated) onStatusUpdated();
    } catch (error) {
      alert(getErrorMessage(error, "Failed to update application status"));
    }
  };

  // Metrics
  const totalCount = applications.length;
  const pendingCount = applications.filter((a) => !a.status || a.status === "APPLIED" || a.status === "PENDING").length;
  const underReviewCount = applications.filter((a) => a.status === "UNDER_REVIEW").length;
  const acceptedCount = applications.filter((a) => a.status === "ACCEPTED").length;
  const rejectedCount = applications.filter((a) => a.status === "REJECTED").length;

  const filteredApplications = applications.filter((app) => {
    const status = (app.status || "APPLIED").toUpperCase();
    if (statusFilter === "PENDING" && status !== "APPLIED" && status !== "PENDING") return false;
    if (statusFilter === "UNDER_REVIEW" && status !== "UNDER_REVIEW") return false;
    if (statusFilter === "ACCEPTED" && status !== "ACCEPTED") return false;
    if (statusFilter === "REJECTED" && status !== "REJECTED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (app.applicantName || "").toLowerCase();
      const email = (app.applicantEmail || app.userId || "").toLowerCase();
      const title = (app.jobTitle || "").toLowerCase();
      const company = (app.jobCompany || "").toLowerCase();
      return name.includes(q) || email.includes(q) || title.includes(q) || company.includes(q);
    }

    return true;
  });

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Candidate Pipeline</h2>
          <p className="admin-subtitle">
            Review and make hiring decisions on candidate applications
          </p>
        </div>
        <button className="btn-ghost" onClick={loadApplications} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {message && <p className="message message--error">{message}</p>}

      {/* Metrics Bar */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => setStatusFilter("ALL")}>
          <div className="metric-number">{totalCount}</div>
          <div className="metric-label">Total Applied</div>
        </div>
        <div className="metric-card metric-card--warning" onClick={() => setStatusFilter("PENDING")}>
          <div className="metric-number">{pendingCount}</div>
          <div className="metric-label">Pending Review</div>
        </div>
        <div className="metric-card metric-card--info" onClick={() => setStatusFilter("UNDER_REVIEW")}>
          <div className="metric-number">{underReviewCount}</div>
          <div className="metric-label">Under Review</div>
        </div>
        <div className="metric-card metric-card--success" onClick={() => setStatusFilter("ACCEPTED")}>
          <div className="metric-number">{acceptedCount}</div>
          <div className="metric-label">Accepted / Shortlisted</div>
        </div>
        <div className="metric-card metric-card--danger" onClick={() => setStatusFilter("REJECTED")}>
          <div className="metric-number">{rejectedCount}</div>
          <div className="metric-label">Not Selected</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="pipeline-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === "ALL" ? "filter-tab--active" : ""}`}
            onClick={() => setStatusFilter("ALL")}
          >
            All ({totalCount})
          </button>
          <button
            className={`filter-tab ${statusFilter === "PENDING" ? "filter-tab--active" : ""}`}
            onClick={() => setStatusFilter("PENDING")}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`filter-tab ${statusFilter === "UNDER_REVIEW" ? "filter-tab--active" : ""}`}
            onClick={() => setStatusFilter("UNDER_REVIEW")}
          >
            Under Review ({underReviewCount})
          </button>
          <button
            className={`filter-tab ${statusFilter === "ACCEPTED" ? "filter-tab--active" : ""}`}
            onClick={() => setStatusFilter("ACCEPTED")}
          >
            Accepted ({acceptedCount})
          </button>
          <button
            className={`filter-tab ${statusFilter === "REJECTED" ? "filter-tab--active" : ""}`}
            onClick={() => setStatusFilter("REJECTED")}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        <div className="pipeline-search">
          <input
            type="text"
            placeholder="Search candidate name, email, or job title…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="empty-state">
          <p className="empty-state-text">Loading candidate applications…</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">No candidate applications found matching this view</p>
        </div>
      ) : (
        <div className="applicant-list">
          {filteredApplications.map((app) => {
            const status = (app.status || "APPLIED").toUpperCase();
            return (
              <div className="applicant-card" key={app.id}>
                <div className="applicant-card-header">
                  <div className="applicant-primary-info">
                    <div className="applicant-avatar">
                      {(app.applicantName || app.userId || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="applicant-name">{app.applicantName || "Anonymous Candidate"}</h3>
                      <p className="applicant-email">{app.applicantEmail || app.userId}</p>
                    </div>
                  </div>

                  <div className="applicant-status-section">
                    <span
                      className={`status-chip status-chip--${status.toLowerCase().replace("_", "-")}`}
                    >
                      {status === "ACCEPTED"
                        ? "✓ Accepted"
                        : status === "REJECTED"
                        ? "✕ Rejected"
                        : status === "UNDER_REVIEW"
                        ? "⏳ Under Review"
                        : "● Pending Review"}
                    </span>
                  </div>
                </div>

                <div className="applicant-job-details">
                  <div className="job-badge-item">
                    <b>Target Position:</b> {app.jobTitle || `Job ID #${app.jobId}`}
                  </div>
                  {app.jobCompany && (
                    <div className="job-badge-item">
                      <b>Company:</b> {app.jobCompany}
                    </div>
                  )}
                  <div className="job-badge-item">
                    <b>Applied on:</b>{" "}
                    {new Date(app.applicationDate || Date.now()).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </div>
                </div>

                {/* Candidate Pitch / Cover Note */}
                {app.coverNote && (
                  <div className="applicant-pitch">
                    <span className="pitch-label">Candidate Note:</span>
                    <p>{app.coverNote}</p>
                  </div>
                )}

                {/* Resume Link */}
                {app.resumeLink && (
                  <div className="applicant-resume">
                    <b>Portfolio / Resume:</b>{" "}
                    <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" className="resume-link">
                      {app.resumeLink} ↗
                    </a>
                  </div>
                )}

                {/* Admin Feedback Display if reviewed */}
                {app.adminFeedback && (
                  <div className="admin-notes-callout">
                    <b>Reviewer Feedback:</b> {app.adminFeedback}
                  </div>
                )}

                {/* Action Bar */}
                <div className="applicant-actions">
                  <div className="action-label">Hiring Decision:</div>

                  <button
                    className={`btn-action btn-action--accept ${status === "ACCEPTED" ? "btn-action--active" : ""}`}
                    onClick={() => handleOpenReview(app, "ACCEPTED")}
                  >
                    ✓ Accept Candidate
                  </button>

                  <button
                    className={`btn-action btn-action--review ${status === "UNDER_REVIEW" ? "btn-action--active" : ""}`}
                    onClick={() => quickUpdateStatus(app.id, "UNDER_REVIEW")}
                  >
                    ⏳ Under Review
                  </button>

                  <button
                    className={`btn-action btn-action--reject ${status === "REJECTED" ? "btn-action--active" : ""}`}
                    onClick={() => handleOpenReview(app, "REJECTED")}
                  >
                    ✕ Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision / Feedback Modal */}
      {activeReviewApp && (
        <div className="modal-backdrop" onClick={handleCloseReview}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  {targetStatus === "ACCEPTED" ? "Accept & Shortlist Candidate" : "Reject Application"}
                </h3>
                <p className="modal-subtitle">
                  Applicant: <b>{activeReviewApp.applicantName || activeReviewApp.userId}</b> for{" "}
                  <b>{activeReviewApp.jobTitle || "Position"}</b>
                </p>
              </div>
              <button className="modal-close-btn" onClick={handleCloseReview}>
                ✕
              </button>
            </div>

            <form onSubmit={submitStatusUpdate}>
              <div className="form-group">
                <label htmlFor="admin-feedback">
                  Feedback / Notes for Candidate <span style={{ opacity: 0.6 }}>(optional)</span>
                </label>
                <textarea
                  id="admin-feedback"
                  rows="3"
                  placeholder={
                    targetStatus === "ACCEPTED"
                      ? "e.g. Congratulations! We would like to schedule an introductory interview."
                      : "e.g. Thank you for your application. Unfortunately we have decided to proceed with other candidates."
                  }
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  disabled={submittingStatus}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={handleCloseReview} disabled={submittingStatus}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={targetStatus === "ACCEPTED" ? "btn-primary" : "btn-danger"}
                  disabled={submittingStatus}
                >
                  {submittingStatus
                    ? "Saving Decision…"
                    : targetStatus === "ACCEPTED"
                    ? "Confirm Acceptance"
                    : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminApplications;
