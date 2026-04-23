import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function JobCarousel() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8082/api/jobs")
      .then((res) => setJobs(res.data.jobs || []))
      .catch((err) => console.log(err));
  }, []);

  return (
    <section className="container py-5">
      <h2 className="text-center mb-4">Current Openings</h2>

      <div className="row justify-content-center g-4">
        {jobs.map((job, index) => (
          <div
            key={index}
            className="col-12 col-md-6 col-lg-4 d-flex justify-content-center"
          >
            <div
              className="card shadow p-3 text-center border-0"
              style={{
                width: "100%",
                maxWidth: "320px",
                borderRadius: "12px",
              }}
            >
              <h5 className="text-primary">{job.jobrole}</h5>

              <p className="mb-1">📍 {job.joblocation}</p>

              <p className="mb-1">🕒 {job.jobtype}</p>

              <p className="text-muted small">{job.jobdescription}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default JobCarousel;
