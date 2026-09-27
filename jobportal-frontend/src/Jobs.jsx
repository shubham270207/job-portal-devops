import { useEffect, useState } from "react";
import api from "./services/api";
import ApplyJob from "./ApplyJob";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");
  const role = localStorage.getItem("role");

  const [searchTitle, setSearchTitle] = useState("");

  const loadJobs = () => {
    api.get("/jobs")
      .then((response) => {
        setJobs(response.data);
        setMessage("Jobs loaded successfully!");
      })
      .catch((error) => {
        console.log(error);
        setMessage("Unable to load jobs");
      });
  };

  const searchJobs = () => {
    if (searchTitle.trim() === "") {
      loadJobs();
      return;
    }
  const deleteJob = async (jobId) => {
    try {
      await api.delete(`/jobs/${jobId}`);

      setMessage("Job deleted successfully!");

      loadJobs();
    } catch (error) {
      console.log(error);
      setMessage("Unable to delete job");
    }
  };

    api.get(`/jobs/search/title?title=${searchTitle}`)
      .then((response) => {
        setJobs(response.data);
        setMessage("Search completed!");
      })
      .catch((error) => {
        console.log(error);
        setMessage("Unable to search jobs");
      });
  };

  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <div>
      <h1>💼 Available Jobs</h1>

      <p>{message}</p>

      {/* Search Jobs */}
      <div>
        <input
          type="text"
          placeholder="Search job title..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />

        <button onClick={searchJobs}>
          Search
        </button>

        <button onClick={loadJobs}>
          Show All
        </button>
      </div>

      <hr />

      {jobs.length === 0 ? (
        <p>No jobs available.</p>
      ) : (
        jobs.map((job) => (
          <div className="job-card" key={job.id}>
            <h2 className="job-title">{job.title}</h2>

            <p>
              <b>Company:</b> {job.company}
            </p>

            <p>
              <b>Location:</b> {job.location}
            </p>

            <p>
              <b>Salary:</b> {job.salary}
            </p>

            <p>
              <b>Skills:</b> {job.skills}
            </p>

            <p>
              <b>Description:</b> {job.description}
            </p>
            <ApplyJob jobId={job.id} />
            {role === "ADMIN" && (
              <button onClick={() => deleteJob(job.id)}>
                Delete Job
              </button>
            )}

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Jobs;