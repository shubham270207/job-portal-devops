import { useEffect, useState } from "react";
import api, { getErrorMessage } from "./services/api";
import ApplyJob from "./ApplyJob";

function Jobs({ role, refreshKey, onApplicationChanged }) {
  const currentRole = role || localStorage.getItem("role") || "USER";
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [searchTitle, setSearchTitle] = useState("");

  const loadJobsAndApplications = async () => {
    setLoading(true);
    try {
      const jobsRes = await api.get("/jobs");
      setJobs(jobsRes.data || []);
      setMessage("");

      // Also fetch user's applications to see which jobs they already applied for
      const userId = localStorage.getItem("email") || localStorage.getItem("name");
      if (userId) {
        try {
          const appsRes = await api.get(`/applications/user/${encodeURIComponent(userId)}`);
          if (Array.isArray(appsRes.data)) {
            const ids = new Set(appsRes.data.map((a) => a.jobId));
            setAppliedJobIds(ids);
          }
        } catch {
          // Non-critical, ignore if applications fail to fetch
        }
      }
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to load jobs"));
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      setMessage("Job deleted successfully!");
      loadJobsAndApplications();
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to delete job"));
    }
  };

  const searchJobs = async () => {
    if (searchTitle.trim() === "") {
      loadJobsAndApplications();
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/jobs/search/title?title=${encodeURIComponent(searchTitle.trim())}`);
      setJobs(response.data || []);
      setMessage("");
    } catch (error) {
      setMessage(getErrorMessage(error, "Unable to search jobs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsAndApplications();
  }, [refreshKey]);

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Available Jobs</h2>
        <span className="section-count">{jobs.length} positions</span>
      </div>

      {message && (
        <p className={`message ${message.toLowerCase().includes("success") || message.toLowerCase().includes("loaded") ? "message--success" : "message--error"}`}>
          {message}
        </p>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by job title…"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchJobs()}
        />
        <button className="btn-primary" onClick={searchJobs} disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
        <button className="btn-ghost" onClick={() => { setSearchTitle(""); loadJobsAndApplications(); }} disabled={loading}>
          Reset
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <p className="empty-state-text">Loading jobs…</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">No jobs match your criteria</p>
        </div>
      ) : (
        <div className="job-list">
          {jobs.map((job) => (
            <div className="job-card" key={job.id}>
              <h3 className="job-title">{job.title}</h3>

              <div className="job-meta">
                <span className="job-meta-item">
                  <b>Company</b> {job.company}
                </span>
                <span className="job-meta-item">
                  <b>Location</b> {job.location}
                </span>
                <span className="job-meta-item">
                  <b>Salary</b> {job.salary}
                </span>
                <span className="job-meta-item">
                  <b>Skills</b> {job.skills}
                </span>
              </div>

              {job.description && (
                <p className="job-description">{job.description}</p>
              )}

              <div className="job-actions">
                {currentRole === "ADMIN" ? (
                  <div className="admin-job-actions">
                    <span className="admin-badge-indicator">Posting Active</span>
                    <button className="btn-danger" onClick={() => deleteJob(job.id)}>
                      Delete Posting
                    </button>
                  </div>
                ) : (
                  <ApplyJob
                    job={job}
                    jobId={job.id}
                    isAlreadyApplied={appliedJobIds.has(job.id)}
                    onApplied={() => {
                      setAppliedJobIds((prev) => new Set([...prev, job.id]));
                      if (onApplicationChanged) {
                        onApplicationChanged();
                      }
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;