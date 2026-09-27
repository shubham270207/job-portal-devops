import api from "./services/api";

function ApplyJob({ jobId }) {
  const handleApply = async () => {
    try {
      const userEmail = localStorage.getItem("name");

      const application = {
        userId: userEmail,
        jobId: jobId,
        applicationDate: new Date().toISOString(),
        status: "APPLIED"
      };

      await api.post("/applications", application);

      alert("Application submitted successfully!");
    } catch (error) {
      console.log(error);
      alert("Failed to apply for job");
    }
  };

  return (
    <button onClick={handleApply}>
      Apply Now
    </button>
  );
}

export default ApplyJob;