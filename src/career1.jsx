import React, { useState, useRef, useEffect } from "react";

const API = "http://192.168.29.185:8082";

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --navy: #0a0f2e;
    --blue: #2058f7;
    --sky: #4fa3ff;
    --accent: #f0c132;
    --white: #ffffff;
    --offwhite: #f5f7ff;
    --muted: #8892b0;
    --card-bg: #ffffff;
    --border: #dde3f5;
    --danger: #ef4444;
    --success: #10b981;
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--offwhite); }

  /* ── TICKER ── */
  .ticker-wrap {
    background: var(--navy);
    overflow: hidden;
    padding: 12px 0;
    position: relative;
    border-bottom: 2px solid var(--blue);
  }
  .ticker-wrap::before, .ticker-wrap::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    width: 80px;
    z-index: 2;
  }
  .ticker-wrap::before { left: 0; background: linear-gradient(to right, var(--navy), transparent); }
  .ticker-wrap::after  { right: 0; background: linear-gradient(to left,  var(--navy), transparent); }

  .ticker-label {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    z-index: 3;
    background: var(--blue);
    color: var(--white);
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 2px;
    text-transform: uppercase;
    padding: 0 18px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .ticker-track {
    display: flex;
    animation: ticker 28s linear infinite;
    will-change: transform;
    padding-left: 200px;
  }
  .ticker-track:hover { animation-play-state: paused; }

  @keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .ticker-item {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    padding: 0 32px;
    color: var(--white);
    font-size: 13px;
  }
  .ticker-item .role { font-weight: 600; color: var(--accent); }
  .ticker-item .dot  { color: var(--sky); font-size: 18px; line-height: 1; }

  /* ── HERO ── */
  .hero {
    background: var(--navy);
    color: var(--white);
    padding: 72px 40px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 60% at 70% 80%, rgba(32,88,247,0.25) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-eyebrow {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    letter-spacing: 4px;
    text-transform: uppercase;
    color: var(--sky);
    margin-bottom: 16px;
  }
  .hero h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(32px, 5vw, 56px);
    font-weight: 800;
    line-height: 1.1;
    margin-bottom: 16px;
    position: relative; z-index: 1;
  }
  .hero h1 span { color: var(--accent); }
  .hero p {
    color: var(--muted);
    max-width: 520px;
    margin: 0 auto 32px;
    font-size: 16px;
    line-height: 1.7;
    position: relative; z-index: 1;
  }

  /* ── ADMIN BUTTON ── */
  .admin-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    background: transparent;
    border: 1.5px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative; z-index: 1;
  }
  .admin-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); }

  /* ── ADMIN PANEL ── */
  .admin-panel {
    max-width: 520px;
    margin: 32px auto;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    padding: 28px;
    box-shadow: 0 4px 24px rgba(10,15,46,0.08);
  }
  .admin-panel h3 {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--navy);
    margin-bottom: 16px;
  }

  /* ── SECTION ── */
  .section { padding: 56px 24px; }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: var(--navy);
    text-align: center;
    margin-bottom: 8px;
  }
  .section-sub {
    text-align: center;
    color: var(--muted);
    font-size: 14px;
    margin-bottom: 36px;
  }

  /* ── JOB CARDS ── */
  .jobs-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    max-width: 1100px;
    margin: 0 auto;
  }
  .job-card {
    background: var(--card-bg);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 22px 24px;
    width: 260px;
    cursor: pointer;
    transition: all 0.22s;
    position: relative;
    user-select: none;
  }
  .job-card:hover { border-color: var(--blue); transform: translateY(-3px); box-shadow: 0 8px 28px rgba(32,88,247,0.12); }
  .job-card.selected { border-color: var(--blue); background: #eff4ff; box-shadow: 0 0 0 3px rgba(32,88,247,0.15); }
  .job-card .check {
    position: absolute;
    top: 14px; right: 14px;
    width: 22px; height: 22px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: var(--white);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    transition: all 0.2s;
  }
  .job-card.selected .check { background: var(--blue); border-color: var(--blue); color: white; }

  .job-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
    margin-bottom: 10px;
  }
  .badge-fulltime  { background: #dcfce7; color: #166534; }
  .badge-contract  { background: #fef9c3; color: #854d0e; }
  .badge-permanent { background: #ede9fe; color: #4c1d95; }
  .badge-default   { background: #f1f5f9; color: #475569; }

  .job-card h3 { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:var(--navy); margin-bottom:6px; }
  .job-card p  { font-size:13px; color:var(--muted); }

  .select-hint { text-align:center; font-size:13px; color:var(--muted); margin-bottom:20px; }
  .selected-count {
    text-align:center;
    font-size:14px;
    font-weight:600;
    color:var(--blue);
    margin-bottom:28px;
  }

  /* ── FORM ── */
  .form-wrap {
    background: var(--white);
    padding: 56px 24px;
  }
  .form-card {
    max-width: 520px;
    margin: 0 auto;
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 20px;
    padding: 40px 36px;
    box-shadow: 0 4px 32px rgba(10,15,46,0.07);
  }
  .form-card h2 {
    font-family: 'Syne', sans-serif;
    font-size: 24px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 6px;
  }
  .form-card .subtitle { font-size: 14px; color: var(--muted); margin-bottom: 28px; }

  .field { margin-bottom: 18px; }
  .field label { display:block; font-size:12px; font-weight:600; letter-spacing:.5px; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }

  .field input, .field textarea, .field select {
    width: 100%;
    padding: 11px 14px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--navy);
    background: var(--offwhite);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }
  .field input:focus, .field textarea:focus {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(32,88,247,0.1);
    background: #fff;
  }
  .field textarea { resize: vertical; min-height: 90px; }

  /* OTP row */
  .otp-row { display:flex; gap:10px; align-items:flex-end; }
  .otp-row .field { flex:1; margin-bottom:0; }
  .otp-send-btn {
    white-space: nowrap;
    padding: 11px 16px;
    background: var(--navy);
    color: var(--white);
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    height: 44px;
  }
  .otp-send-btn:hover { background: #1a2560; }
  .otp-send-btn:disabled { opacity: .5; cursor: not-allowed; }

  /* Status messages */
  .msg { font-size: 13px; margin-top: 8px; padding: 10px 14px; border-radius: 8px; }
  .msg.success { background: #d1fae5; color: #065f46; }
  .msg.error   { background: #fee2e2; color: #991b1b; }
  .msg.info    { background: #eff6ff; color: #1d4ed8; }

  /* verified badge */
  .verified-badge {
    display:inline-flex; align-items:center; gap:6px;
    font-size:13px; font-weight:600; color: var(--success);
    background:#d1fae5; padding:6px 12px; border-radius:20px;
    margin-bottom: 20px;
  }

  /* submit */
  .submit-btn {
    width: 100%;
    padding: 14px;
    background: var(--blue);
    color: var(--white);
    border: none;
    border-radius: 12px;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    margin-top: 8px;
  }
  .submit-btn:hover  { background: #1a47d6; transform: translateY(-1px); }
  .submit-btn:active { transform: translateY(0); }
  .submit-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

  /* file input */
  input[type="file"] { cursor: pointer; }

  /* footer */
  footer {
    background: var(--navy);
    color: var(--muted);
    text-align: center;
    padding: 20px;
    font-size: 13px;
  }

  /* admin file input */
  .file-input-row { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
  .file-input-row input[type="file"] { flex:1; font-size:13px; color:var(--navy); }
  .upload-btn {
    padding: 10px 20px;
    background: var(--blue);
    color: var(--white);
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  .upload-btn:hover { background: #1a47d6; }
  .upload-btn:disabled { opacity: .5; cursor: not-allowed; }
`;

// ─── BADGE HELPER ────────────────────────────────────────────────────────────
function badgeClass(type = "") {
  const t = type.toLowerCase();
  if (t.includes("full")) return "badge-fulltime";
  if (t.includes("contract")) return "badge-contract";
  if (t.includes("perm")) return "badge-permanent";
  return "badge-default";
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function CareerPage() {
  // Jobs from server
  const [jobs, setJobs] = useState([]);

  // Admin panel
  const [showAdmin, setShowAdmin] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [adminMsg, setAdminMsg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const excelRef = useRef(null);

  // Selected jobs
  const [selectedJobs, setSelectedJobs] = useState([]);

  // Form
  const initialForm = {
    name: "",
    email: "",
    mobile: "",
    message: "",
    resume: null,
  };
  const [formData, setFormData] = useState(initialForm);
  const fileRef = useRef(null);

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpMsg, setOtpMsg] = useState(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState(null);

  // ── Fetch jobs on load ──
  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      const res = await fetch(`${API}/api/jobs`);
      const data = await res.json();
      if (data.success) setJobs(data.jobs);
    } catch (e) {
      console.warn("Could not load jobs:", e);
    }
  }

  // ── OTP countdown ──
  useEffect(() => {
    if (otpTimer <= 0) return;
    const id = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [otpTimer]);

  // ── Admin Excel upload ──
  async function handleAdminUpload() {
    if (!excelFile)
      return setAdminMsg({
        type: "error",
        text: "Please select an Excel file.",
      });
    setUploading(true);
    setAdminMsg(null);
    const fd = new FormData();
    fd.append("excelFile", excelFile);
    try {
      const res = await fetch(`${API}/api/admin/upload-jobs`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success) {
        setAdminMsg({ type: "success", text: data.message });
        setJobs(data.jobs);
        setExcelFile(null);
        if (excelRef.current) excelRef.current.value = "";
      } else {
        setAdminMsg({ type: "error", text: data.message });
      }
    } catch {
      setAdminMsg({
        type: "error",
        text: "Upload failed. Check server connection.",
      });
    } finally {
      setUploading(false);
    }
  }

  // ── Toggle job selection ──
  function toggleJob(role) {
    setSelectedJobs((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  }

  // ── Form change ──
  function handleChange(e) {
    const { name, value, files } = e.target;
    if (name === "resume") setFormData((f) => ({ ...f, resume: files[0] }));
    else setFormData((f) => ({ ...f, [name]: value }));
    // If email changes, reset OTP
    if (name === "email") {
      setOtpSent(false);
      setOtpVerified(false);
      setOtpValue("");
      setOtpMsg(null);
    }
  }

  // ── Send OTP ──
  async function handleSendOTP() {
    if (!formData.name || !formData.email)
      return setOtpMsg({
        type: "error",
        text: "Enter your name and email first.",
      });
    setOtpMsg({ type: "info", text: "Sending OTP…" });
    try {
      const res = await fetch(`${API}/api/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, email: formData.email }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtpTimer(300);
        setOtpMsg({ type: "success", text: `OTP sent to ${formData.email}` });
      } else {
        setOtpMsg({ type: "error", text: data.message });
      }
    } catch {
      setOtpMsg({ type: "error", text: "Failed to send OTP." });
    }
  }

  // ── Verify OTP ──
  async function handleVerifyOTP() {
    if (!otpValue) return setOtpMsg({ type: "error", text: "Enter the OTP." });
    try {
      const res = await fetch(`${API}/api/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpValue }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpVerified(true);
        setOtpMsg(null);
      } else {
        setOtpMsg({ type: "error", text: data.message });
      }
    } catch {
      setOtpMsg({ type: "error", text: "Verification failed." });
    }
  }

  // ── Submit application ──
  async function handleSubmit(e) {
    e.preventDefault();
    if (!otpVerified)
      return setSubmitMsg({
        type: "error",
        text: "Please verify your email OTP first.",
      });
    if (selectedJobs.length === 0)
      return setSubmitMsg({
        type: "error",
        text: "Please select at least one job opening.",
      });
    if (!formData.resume)
      return setSubmitMsg({
        type: "error",
        text: "Please upload your resume.",
      });

    setSubmitting(true);
    setSubmitMsg(null);
    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("email", formData.email);
    fd.append("mobile", formData.mobile);
    fd.append("message", formData.message);
    fd.append("resume", formData.resume);
    fd.append("selectedJobs", JSON.stringify(selectedJobs));

    try {
      const res = await fetch(`${API}/api/apply`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setSubmitMsg({ type: "success", text: data.message });
        setFormData(initialForm);
        setSelectedJobs([]);
        setOtpSent(false);
        setOtpVerified(false);
        setOtpValue("");
        setOtpMsg(null);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setSubmitMsg({ type: "error", text: data.message });
      }
    } catch {
      setSubmitMsg({
        type: "error",
        text: "Submission failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Duplicate ticker items for seamless loop
  const tickerJobs = jobs.length > 0 ? [...jobs, ...jobs] : [];

  return (
    <>
      <style>{styles}</style>

      {/* ── SCROLLING TICKER ── */}
      {jobs.length > 0 && (
        <div className="ticker-wrap">
          <div className="ticker-label">Now Hiring</div>
          <div className="ticker-track">
            {tickerJobs.map((job, i) => (
              <div className="ticker-item" key={i}>
                <span className="role">{job.jobrole}</span>
                <span>·</span>
                <span>{job.joblocation}</span>
                <span>·</span>
                <span>{job.jobtype}</span>
                  <span>{job.descrpition}</span>
                <span className="dot">◆</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero">
        <p className="hero-eyebrow">We're growing fast</p>
        <h1>
          Join Our Team at <span>SES</span>
        </h1>
        <p>
          We're looking for talented people who are passionate about building
          great things. Your next big opportunity starts here.
        </p>
        <button className="admin-btn" onClick={() => setShowAdmin(!showAdmin)}>
          ⚙ Admin — Upload Jobs Excel
        </button>
      </section>

      {/* ── ADMIN PANEL ── */}
      {showAdmin && (
        <div style={{ background: "#f5f7ff", padding: "16px 24px" }}>
          <div className="admin-panel">
            <h3>📁 Upload Job Openings (Excel)</h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              Excel columns required:{" "}
              <strong>jobrole, joblocation, jobtype, targetmail</strong>
            </p>
            <div className="file-input-row">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                ref={excelRef}
                onChange={(e) => setExcelFile(e.target.files[0])}
              />
              <button
                className="upload-btn"
                onClick={handleAdminUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading…" : "Upload"}
              </button>
            </div>
            {adminMsg && (
              <div className={`msg ${adminMsg.type}`}>{adminMsg.text}</div>
            )}
          </div>
        </div>
      )}

      {/* ── JOB OPENINGS ── */}
      <section className="section" style={{ background: "#fff" }}>
        <h2 className="section-title">Current Openings</h2>
        <p className="section-sub">
          {jobs.length > 0
            ? `${jobs.length} position${jobs.length !== 1 ? "s" : ""} available · Select the roles you'd like to apply for`
            : "No openings loaded yet. Admin can upload an Excel file above."}
        </p>

        {selectedJobs.length > 0 && (
          <div className="selected-count">
            ✓ {selectedJobs.length} role{selectedJobs.length > 1 ? "s" : ""}{" "}
            selected
          </div>
        )}

        {jobs.length > 0 && (
          <p className="select-hint">Click a card to select / deselect</p>
        )}

        <div className="jobs-grid">
          {jobs.map((job, i) => (
            <div
              key={i}
              className={`job-card ${selectedJobs.includes(job.jobrole) ? "selected" : ""}`}
              onClick={() => toggleJob(job.jobrole)}
            >
              <div className="check">
                {selectedJobs.includes(job.jobrole) ? "✓" : ""}
              </div>
              <span className={`job-badge ${badgeClass(job.jobtype)}`}>
                {job.jobtype}
              </span>
              <h3>{job.jobrole}</h3>
              <p>📍 {job.joblocation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── APPLICATION FORM ── */}
      <div className="form-wrap">
        <div className="form-card">
          <h2>Submit Your Application</h2>
          <p className="subtitle">
            Fill in your details, verify your email, and upload your resume.
          </p>

          {selectedJobs.length > 0 && (
            <div
              style={{
                marginBottom: 20,
                padding: "10px 14px",
                background: "#eff4ff",
                borderRadius: 10,
                fontSize: 13,
                color: "#1d4ed8",
              }}
            >
              <strong>Applying for:</strong> {selectedJobs.join(", ")}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            {/* Email + OTP send */}
            <div className="field">
              <label>Email Address</label>
             
                <div className="field" style={{ marginBottom: 0 }}>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@email.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
               
              </div>
            </div>

        

           

           

            {/* Mobile */}
            <div className="field">
              <label>Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                placeholder="+91 98765 43210"
                required
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>

            {/* Message */}
            <div className="field">
              <label>Cover Message (Optional)</label>
              <textarea
                name="message"
                placeholder="Tell us about yourself…"
                value={formData.message}
                onChange={handleChange}
              />
            </div>

            {/* Resume */}
            <div className="field">
              <label>Upload Resume (PDF / DOC / DOCX)</label>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx"
                required
                ref={fileRef}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Application →"}
            </button>

            {submitMsg && (
              <div
                className={`msg ${submitMsg.type}`}
                style={{ marginTop: 16 }}
              >
                {submitMsg.text}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <p>© 2026 SES Company. All rights reserved.</p>
      </footer>
    </>
  );
}
