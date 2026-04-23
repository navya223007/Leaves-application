import React, { useState, useEffect } from "react";

const API = "http://localhost:8082";

export default function CareerPage() {
  // Admin
  const [adminEmail, setAdminEmail] = useState("");
  const [adminOtp, setAdminOtp] = useState("");
  const [adminVerified, setAdminVerified] = useState(false);
  const [file, setFile] = useState(null);

  // Jobs
  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);

  // Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    resume: null,
  });

  // ================= ADMIN =================
  const sendAdminOTP = async () => {
    await fetch(`${API}/api/admin/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail }),
    });
    alert("OTP Sent");
  };

  const verifyAdminOTP = async () => {
    const res = await fetch(`${API}/api/admin/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: adminEmail, otp: adminOtp }),
    });
    const data = await res.json();
    if (data.success) {
      setAdminVerified(true);
      alert("Admin Verified");
    } else {
      alert("Invalid OTP");
    }
  };

  const uploadExcel = async () => {
    const fd = new FormData();
    fd.append("excelFile", file);

    const res = await fetch(`${API}/api/admin/upload-jobs`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    if (data.success) {
      setJobs(data.jobs);
      alert("Jobs Uploaded");
    }
  };

  // ================= JOBS =================
  useEffect(() => {
    fetch(`${API}/api/jobs`)
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs || []));
  }, []);

  const toggleJob = (role) => {
    setSelectedJobs((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  // ================= FORM =================
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "resume") {
      setFormData({ ...formData, resume: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedJobs.length === 0) {
      return alert("Select at least one role");
    }

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("email", formData.email);
    fd.append("mobile", formData.mobile);
    fd.append("resume", formData.resume);
    fd.append("selectedJobs", JSON.stringify(selectedJobs));

    const res = await fetch(`${API}/api/apply`, {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    alert(data.message || "Submitted");
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h2>Career Page</h2>

      {/* ===== ADMIN ===== */}
      <h3>Admin Verification</h3>
      <input
        placeholder="Admin Email"
        value={adminEmail}
        onChange={(e) => setAdminEmail(e.target.value)}
      />
      <button onClick={sendAdminOTP}>Send OTP</button>

      <br />

      <input
        placeholder="Enter OTP"
        value={adminOtp}
        onChange={(e) => setAdminOtp(e.target.value)}
      />
      <button onClick={verifyAdminOTP}>Verify</button>

      {adminVerified && (
        <>
          <h4>Upload Excel</h4>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={uploadExcel}>Upload</button>
        </>
      )}

      <hr />

      {/* ===== JOBS ===== */}
      <h3>Select Roles (Multiple Openings)</h3>

      <div style={{ display: "flex", overflowX: "auto", gap: 10 }}>
        {jobs.map((job, i) => (
          <div
            key={i}
            onClick={() => toggleJob(job.jobrole)}
            style={{
              minWidth: 200,
              border: "1px solid #ccc",
              padding: 10,
              cursor: "pointer",
              background: selectedJobs.includes(job.jobrole)
                ? "#dbeafe"
                : "#fff",
            }}
          >
            <h4>{job.jobrole}</h4>
            <p>{job.joblocation}</p>
            <small>{job.jobtype}</small>
          </div>
        ))}
      </div>

      <hr />

      {/* ===== FORM ===== */}
      <h3>Apply</h3>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} required />
        <br />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <br />
        <input name="mobile" placeholder="Mobile" onChange={handleChange} required />
        <br />
        <input type="file" name="resume" onChange={handleChange} required />
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}