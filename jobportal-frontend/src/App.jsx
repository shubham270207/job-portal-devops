import { useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import api from "./services/api";
import Jobs from "./Jobs";
import AddJob from "./AddJob";
import MyApplications from "./MyApplications";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [showRegister, setShowRegister] = useState(false);

  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");

  const loadDashboard = () => {
    api.get("/users")
      .then((response) => {
        setUsers(response.data);
        setMessage("Dashboard loaded successfully!");
      })
      .catch(() => {
        setMessage("Session expired. Please login again.");
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    setLoggedIn(false);
  };

  if (!loggedIn) {
    if (showRegister) {
      return (
        <div>
          <Register />

          <button onClick={() => setShowRegister(false)}>
            Go to Login
          </button>
        </div>
      );
    }

    return (
      <div>
        <Login
          onLogin={() => {
            setLoggedIn(true);
            setTimeout(loadDashboard, 100);
          }}
        />

        <button onClick={() => setShowRegister(true)}>
          Create New Account
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1>💼 Job Portal</h1>
          <p>
            Welcome, <b>{name}</b> 👋
          </p>
          <span className="role-badge">{role}</span>
        </div>

        <div>
          <button
            className="load-button"
            onClick={loadDashboard}
          >
            Load Users
          </button>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      <p>{message}</p>

      <hr />

      <h2>Registered Users</h2>
      {role === "ADMIN" && <AddJob />}
      <Jobs />
      <MyApplications />

      {users.map((user) => (
        <div key={user.id}>
          <p><b>Name:</b> {user.name}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Role:</b> {user.role}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;