import { useState } from "react";
import ApplyModal from "./ApplyModal";

function ApplyJob({ job, jobId, isAlreadyApplied = false, onApplied }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [applied, setApplied] = useState(isAlreadyApplied);

  const jobObj = job || { id: jobId, title: "Position", company: "Company" };

  if (applied) {
    return (
      <button className="btn-ghost" disabled style={{ opacity: 0.9, color: "#10b981", fontWeight: 600 }}>
        ✓ Applied
      </button>
    );
  }

  return (
    <>
      <button
        className="btn-primary"
        onClick={() => setModalOpen(true)}
      >
        Apply Now
      </button>

      <ApplyModal
        job={jobObj}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onApplied={(appliedJobId) => {
          setApplied(true);
          if (onApplied) onApplied(appliedJobId);
        }}
      />
    </>
  );
}

export default ApplyJob;