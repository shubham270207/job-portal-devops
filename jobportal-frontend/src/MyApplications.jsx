import { useEffect, useState } from "react";
import api, { getErrorMessage } from "./services/api";

function MyApplications({ refreshKey }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadApplications = () => {
    const userId = localStorage.getItem("email") || localStorage.getItem("name");

    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");

    api.get(`/applications/user/${encodeURIComponent(userId)}`)
      .then((response) => {
        setApplications(response.data || []);
      })
      .catch((error) => {
        setMessage(getErrorMessage(error, "Unable to load applications"));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadApplications();
  }, [refreshKey]);

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">My Applications</h2>
          <p className="admin-subtitle">Track the status of your submitted job applications</p>
        </div>
        <button className="btn-ghost" onClick={loadApplications} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {message && <p className="message message--error">{message}</p>}

      {loading ? (
        <div className="empty-state">
          <p className="empty-state-text">Loading your applications…</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">You haven&apos;t applied to any jobs yet</p>
        </div>
      ) : (
        <div className="application-list">
          {applications.map((app) => {
            const status = (app.status || "APPLIED").toUpperCase();
            return (
              <div className="candidate-app-card" key={app.id}>
                <div className="candidate-app-header">
                  <div>
                    <h3 className="candidate-app-title">
                      {app.jobTitle || `Job #${app.jobId}`}
                    </h3>
                    <p className="candidate-app-company">
                      {app.jobCompany ? <b>{app.jobCompany}</b> : "Direct Company Application"} • Applied on{" "}
                      {new Date(app.applicationDate || Date.now()).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>

                  <span className={`status-chip status-chip--${status.toLowerCase().replace("_", "-")}`}>
                    {status === "ACCEPTED"
                      ? "✓ Accepted / Offer Extended"
                      : status === "REJECTED"
                      ? "✕ Not Selected"
                      : status === "UNDER_REVIEW"
                      ? "⏳ Under Review"
                      : "● Application Submitted"}
                  </span>
                </div>

                {/* Status Explanation Callout */}
                <div className={`status-banner status-banner--${status.toLowerCase().replace("_", "-")}`}>
                  {status === "ACCEPTED" && (
                    <p>
                      🎉 <b>Great news!</b> Your application has been reviewed and approved by the hiring team.
                    </p>
                  )}
                  {status === "UNDER_REVIEW" && (
                    <p>
                      👀 <b>Application Active:</b> The recruiter has opened and is currently reviewing your profile.
                    </p>
                  )}
                  {status === "REJECTED" && (
                    <p>
                      Thank you for your interest. The hiring team decided to move forward with other applicants for this role.
                    </p>
                  )}
                  {(status === "APPLIED" || status === "PENDING") && (
                    <p>
                      📩 Your application was received. It is in queue for review by the hiring manager.
                    </p>
                  )}
                </div>

                {/* Recruiter Feedback note */}
                {app.adminFeedback && (
                  <div className="admin-notes-callout">
                    <b>Note from Recruiter:</b> {app.adminFeedback}
                  </div>
                )}

                {/* Submitted Pitch & Link */}
                {(app.coverNote || app.resumeLink) && (
                  <div className="candidate-app-footer">
                    {app.resumeLink && (
                      <span className="app-detail-tag">
                        📎 <a href={app.resumeLink} target="_blank" rel="noopener noreferrer">Attached Resume / Link</a>
                      </span>
                    )}
                    {app.coverNote && (
                      <span className="app-detail-tag">
                        💬 <i>&ldquo;{app.coverNote}&rdquo;</i>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyApplications;