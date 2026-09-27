import { useEffect, useState } from "react";
import api from "./services/api";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState("");

  const loadApplications = async () => {
    try {
      const userEmail = localStorage.getItem("name");

      const response = await api.get(
        `/applications/user/${userEmail}`
      );

      setApplications(response.data);
      setMessage("Applications loaded successfully!");
    } catch (error) {
      console.log(error);
      setMessage("Unable to load applications");
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <div>
      <h1>📋 My Applications</h1>

      <p>{message}</p>

      {applications.length === 0 ? (
        <p>No applications found.</p>
      ) : (
        applications.map((application) => (
          <div key={application.id}>
            <p>
              <b>Job ID:</b> {application.jobId}
            </p>

            <p>
              <b>Status:</b> {application.status}
            </p>

            <p>
              <b>Applied On:</b> {application.applicationDate}
            </p>

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default MyApplications;