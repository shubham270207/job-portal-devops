import { useEffect, useState } from "react";
import api, { getErrorMessage } from "./services/api";

function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const loadUsers = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await api.get("/users");
      setUsers(response.data || []);
    } catch (error) {
      setMessage(getErrorMessage(error, "Failed to load user directory"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalUsers = users.length;
  const candidateCount = users.filter((u) => u.role === "USER" || !u.role).length;
  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  const filteredUsers = users.filter((u) => {
    const role = (u.role || "USER").toUpperCase();
    if (roleFilter === "USER" && role !== "USER") return false;
    if (roleFilter === "ADMIN" && role !== "ADMIN") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    }

    return true;
  });

  return (
    <div className="section">
      <div className="section-header">
        <div>
          <h2 className="section-title">User Management Directory</h2>
          <p className="admin-subtitle">
            Admin access only: Manage and inspect registered candidates and employer accounts
          </p>
        </div>
        <button className="btn-ghost" onClick={loadUsers} disabled={loading}>
          {loading ? "Refreshing…" : "↻ Refresh Users"}
        </button>
      </div>

      {message && <p className="message message--error">{message}</p>}

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => setRoleFilter("ALL")}>
          <div className="metric-number">{totalUsers}</div>
          <div className="metric-label">Total Registered Accounts</div>
        </div>
        <div className="metric-card metric-card--info" onClick={() => setRoleFilter("USER")}>
          <div className="metric-number">{candidateCount}</div>
          <div className="metric-label">Job Seekers (Candidates)</div>
        </div>
        <div className="metric-card metric-card--warning" onClick={() => setRoleFilter("ADMIN")}>
          <div className="metric-number">{adminCount}</div>
          <div className="metric-label">Admins / Recruiters</div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="pipeline-controls">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${roleFilter === "ALL" ? "filter-tab--active" : ""}`}
            onClick={() => setRoleFilter("ALL")}
          >
            All Accounts ({totalUsers})
          </button>
          <button
            className={`filter-tab ${roleFilter === "USER" ? "filter-tab--active" : ""}`}
            onClick={() => setRoleFilter("USER")}
          >
            Candidates ({candidateCount})
          </button>
          <button
            className={`filter-tab ${roleFilter === "ADMIN" ? "filter-tab--active" : ""}`}
            onClick={() => setRoleFilter("ADMIN")}
          >
            Admins ({adminCount})
          </button>
        </div>

        <div className="pipeline-search">
          <input
            type="text"
            placeholder="Search by user name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="empty-state">
          <p className="empty-state-text">Loading user directory…</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p className="empty-state-text">No registered users match your search criteria</p>
        </div>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Account Type</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const isAdmin = (user.role || "").toUpperCase() === "ADMIN";
              return (
                <tr key={user.id || user.email}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          background: isAdmin ? "#fdf2f8" : "var(--brand-100)",
                          color: isAdmin ? "#db2777" : "var(--brand-700)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "13px"
                        }}
                      >
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${isAdmin ? "role-badge--admin" : ""}`}>
                      {isAdmin ? "Employer / Admin" : "Candidate"}
                    </span>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--text-tertiary)" }}>
                    {user.id || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserDirectory;
