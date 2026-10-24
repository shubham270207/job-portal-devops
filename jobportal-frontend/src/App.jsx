import { useState, useEffect } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import api from "./services/api";
import Jobs from "./Jobs";
import AddJob from "./AddJob";
import MyApplications from "./MyApplications";
import AdminApplications from "./AdminApplications";
import UserDirectory from "./UserDirectory";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [showRegister, setShowRegister] = useState(false);

  const [role, setRole] = useState(localStorage.getItem("role") || "USER");
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("role") === "ADMIN" ? "pipeline" : "jobs"
  );

  const [message, setMessage] = useState("");

  // Pending applications count for Admin badge
  const [pendingAppsCount, setPendingAppsCount] = useState(0);

  // Keys used to trigger refresh in child components
  const [jobsRefreshKey, setJobsRefreshKey] = useState(0);
  const [appsRefreshKey, setAppsRefreshKey] = useState(0);

  const name = localStorage.getItem("name") || "User";
  const email = localStorage.getItem("email") || "";

  const triggerJobsRefresh = () => setJobsRefreshKey((k) => k + 1);
  const triggerAppsRefresh = () => {
    setAppsRefreshKey((k) => k + 1);
    fetchPendingCount();
  };

  const fetchPendingCount = async () => {
    if (!loggedIn) return;
    // Only admins can fetch all applications
    const currentRole = localStorage.getItem("role");
    if (currentRole !== "ADMIN") return;
    try {
      const res = await api.get("/applications");
      if (Array.isArray(res.data)) {
        const pending = res.data.filter(
          (a) => !a.status || a.status === "APPLIED" || a.status === "PENDING"
        ).length;
        setPendingAppsCount(pending);
      }
    } catch {
      // Non-critical background fetch
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchPendingCount();
    }
  }, [loggedIn, appsRefreshKey]);



  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    setLoggedIn(false);
    setMessage("");
  };

  if (!loggedIn) {
    return (
      <div className="auth-wrapper">
        <div>
          {showRegister ? (
            <>
              <Register onRegistered={() => setShowRegister(false)} />
              <div className="auth-toggle">
                Already have an account?{" "}
                <button onClick={() => setShowRegister(false)}>
                  Sign in
                </button>
              </div>
            </>
          ) : (
            <>
              <Login
                onLogin={(chosenRole) => {
                  const storedRole = chosenRole || localStorage.getItem("role") || "USER";
                  setLoggedIn(true);
                  setRole(storedRole);
                  setActiveTab(storedRole === "ADMIN" ? "pipeline" : "jobs");
                  setMessage("");
                }}
              />
              <div className="auth-toggle">
                Don&apos;t have an account?{" "}
                <button onClick={() => setShowRegister(true)}>
                  Create one
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Top Header */}
      <div className="dashboard-header">
        <div>
          <div className="portal-branding">
            <h1>Job Portal</h1>
            <span className={`role-badge ${role === "ADMIN" ? "role-badge--admin" : ""}`}>
              {role === "ADMIN" ? "Employer / Admin" : "Candidate"}
            </span>
          </div>
          <p className="welcome-text">
            Welcome, <b>{name}</b> {email && <span style={{ opacity: 0.75 }}>({email})</span>}
          </p>
        </div>

        <div className="header-actions">
          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      {message && (
        <p className={`message ${message.toLowerCase().includes("success") ? "message--success" : "message--error"}`}>
          {message}
        </p>
      )}

      {/* Navigation Tabs */}
      <div className="nav-tabs-bar">
        {role === "ADMIN" ? (
          <>
            <button
              className={`nav-tab-item ${activeTab === "pipeline" ? "nav-tab-item--active" : ""}`}
              onClick={() => setActiveTab("pipeline")}
            >
              📋 Candidate Applications
              {pendingAppsCount > 0 && (
                <span className="nav-tab-badge">{pendingAppsCount} pending</span>
              )}
            </button>

            <button
              className={`nav-tab-item ${activeTab === "jobs" ? "nav-tab-item--active" : ""}`}
              onClick={() => setActiveTab("jobs")}
            >
              💼 Manage Job Postings
            </button>

            <button
              className={`nav-tab-item ${activeTab === "post-job" ? "nav-tab-item--active" : ""}`}
              onClick={() => setActiveTab("post-job")}
            >
              ➕ Post New Job
            </button>

            <button
              className={`nav-tab-item ${activeTab === "users" ? "nav-tab-item--active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              👥 User Management
            </button>
          </>
        ) : (
          <>
            <button
              className={`nav-tab-item ${activeTab === "jobs" ? "nav-tab-item--active" : ""}`}
              onClick={() => setActiveTab("jobs")}
            >
              💼 Explore Jobs
            </button>

            <button
              className={`nav-tab-item ${activeTab === "my-applications" ? "nav-tab-item--active" : ""}`}
              onClick={() => setActiveTab("my-applications")}
            >
              📋 My Applications
            </button>
          </>
        )}
      </div>

      {/* Tab Contents */}
      <div className="tab-content-area">
        {/* Candidate & Admin Jobs view */}
        {activeTab === "jobs" && (
          <Jobs
            role={role}
            refreshKey={jobsRefreshKey}
            onApplicationChanged={triggerAppsRefresh}
          />
        )}

        {/* Candidate Applications view */}
        {role === "USER" && activeTab === "my-applications" && (
          <MyApplications
            refreshKey={appsRefreshKey}
          />
        )}

        {/* Admin Candidate Pipeline view */}
        {role === "ADMIN" && activeTab === "pipeline" && (
          <AdminApplications
            refreshKey={appsRefreshKey}
            onStatusUpdated={() => {
              triggerAppsRefresh();
            }}
          />
        )}

        {/* Admin Post Job view */}
        {role === "ADMIN" && activeTab === "post-job" && (
          <AddJob
            onJobAdded={() => {
              triggerJobsRefresh();
              setActiveTab("jobs");
            }}
          />
        )}

        {/* Admin Dedicated User Management page */}
        {role === "ADMIN" && activeTab === "users" && (
          <UserDirectory />
        )}
      </div>
    </div>
  );
}

export default App;