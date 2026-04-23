import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminUploadPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [file, setFile] = useState(null);

  /* SEND OTP */

  const sendOTP = async () => {
    try {
      const res = await axios.post("http://localhost:8082/api/send-otp", {
        email,
      });

      alert(res.data.message);
    } catch (error) {
      console.error(error);
      alert("Failed to send OTP");
    }
  };

  /* VERIFY OTP */

  const verifyOTP = async () => {
    try {
      const res = await axios.post("http://localhost:8082/api/verify-otp", {
        otp,
      });

      alert(res.data.message);

      setVerified(true);
    } catch (error) {
      console.error(error);
      alert("Invalid OTP");
    }
  };

  /* UPLOAD EXCEL */

  const uploadExcel = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8082/api/upload-jobs",
        formData,
      );

      alert(res.data.message);

      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Admin Upload Job Excel</h2>

      {/* EMAIL */}

      <div className="mb-3">
        <label>Admin Email</label>

        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* SEND OTP */}

      <button className="btn btn-primary" onClick={sendOTP}>
        Send OTP
      </button>

      <br />
      <br />

      {/* OTP */}

      <div className="mb-3">
        <label>Enter OTP</label>

        <input
          type="text"
          className="form-control"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </div>

      <button className="btn btn-success" onClick={verifyOTP}>
        Verify OTP
      </button>

      <br />
      <br />

      {/* FILE */}

      {verified && (
        <>
          <div className="mb-3">
            <label>Upload Excel File</label>

            <input
              type="file"
              className="form-control"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button className="btn btn-warning" onClick={uploadExcel}>
            Upload Excel
          </button>
        </>
      )}

      <br />
      <br />

      <button className="btn btn-secondary" onClick={() => navigate("/")}>
        Exit to Career Page
      </button>
    </div>
  );
}
