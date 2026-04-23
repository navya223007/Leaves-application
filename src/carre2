import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import JobCarousel from "./JobCarousel";

export default function CareerPage() {
  const navigate = useNavigate();

  const initialState = {
    name: "",
    email: "",
    mobile: "",
    message: "",
    resume: null,
  };

  const [formData, setFormData] = useState(initialState);
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);

  const fileRef = useRef(null);

  /* ================= FETCH JOBS (ONLY ONCE) ================= */
  useEffect(() => {
    axios
      .get("http://localhost:8082/api/jobs")
      .then((res) => {
        console.log("Jobs API:", res.data);
        setJobs(res.data.jobs || res.data || []);
      })
      .catch((err) => console.log(err));
  }, []);

  /* ================= INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  /* ================= JOB SELECT ================= */
  const handleJobSelect = (role) => {
    if (selectedJobs.includes(role)) {
      setSelectedJobs(selectedJobs.filter((j) => j !== role));
    } else {
      setSelectedJobs([...selectedJobs, role]);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedJobs.length === 0) {
      alert("Please select job role");
      return;
    }

    const fd = new FormData();

    fd.append("name", formData.name);
    fd.append("email", formData.email);
    fd.append("mobile", formData.mobile);
    fd.append("message", formData.message);
    fd.append("resume", formData.resume);
    fd.append("selectedJobs", JSON.stringify(selectedJobs));

    try {
      const res = await axios.post("http://localhost:8082/api/apply", fd);

      alert(res.data.message);

      setFormData(initialState);
      setSelectedJobs([]);

      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.log(err);
      alert("Submission failed");
    }
  };

  return (
    <div style={{ fontFamily: "Arial", background: "#f4f6f8" }}>
      {/* HERO */}
      <section
        style={{
          background: "linear-gradient(to right,#2563eb,#4f46e5)",
          color: "white",
          padding: "60px",
          textAlign: "center",
          position: "relative",
        }}
      >
        <button
          onClick={() => navigate("/admin-upload")}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "10px 15px",
            background: "#111827",
            color: "white",
            border: "none",
            borderRadius: "6px",
          }}
        >
          Admin Upload Excel
        </button>

        <h1>Join Our Team</h1>
        <p>Submit your resume and apply for open positions.</p>
      </section>

      {/* JOB CAROUSEL */}
      <JobCarousel jobs={jobs} />

      {/* FORM */}
      <section style={{ padding: "40px", background: "white" }}>
        <div
          style={{
            maxWidth: "500px",
            margin: "auto",
            padding: "30px",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            Submit Your Resume
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <textarea
              name="message"
              placeholder="Message"
              value={formData.message}
              onChange={handleChange}
              style={inputStyle}
            />

            <input
              type="file"
              name="resume"
              ref={fileRef}
              onChange={handleChange}
              style={inputStyle}
              required
            />

            <button style={buttonStyle}>Submit Application</button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          background: "#111827",
          color: "white",
          textAlign: "center",
          padding: "15px",
        }}
      >
        © 2026 SES Company
      </footer>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
};
