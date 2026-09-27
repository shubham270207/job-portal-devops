import { useState } from "react";
import api from "./services/api";

function AddJob() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    skills: "",
    description: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/jobs", form);

      setMessage("Job added successfully!");

      setForm({
        title: "",
        company: "",
        location: "",
        salary: "",
        skills: "",
        description: ""
      });
    } catch (error) {
      console.log(error);
      setMessage("Failed to add job");
    }
  };

  return (
    <div className="add-job-card">
      <h1>➕ Add New Job</h1>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Job Title: </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Company: </label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Location: </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Salary: </label>
          <input
            type="text"
            name="salary"
            value={form.salary}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Skills: </label>
          <input
            type="text"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Description: </label>
          <br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <button type="submit">
          Add Job
        </button>

      </form>

      <p>{message}</p>
    </div>
  );
}

export default AddJob;