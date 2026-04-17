require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const xlsx = require("xlsx");
const nodemailer = require("nodemailer");
const fs = require("fs");
const mysql = require("mysql2");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= DATABASE CONNECTION ================= */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "career_portal",
});

db.connect((err) => {
  if (err) {
    console.log("DB connection failed:", err);
  } else {
    console.log("MySQL Connected");
  }
});

/* ================= OTP STORAGE ================= */

let storedOTP = null;
let otpExpiry = null;
let isVerified = false;

/* ================= EMAIL CONFIG ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= SEND OTP ================= */

app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    storedOTP = otp;
    otpExpiry = Date.now() + 5 * 60 * 1000;
    isVerified = false;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ================= VERIFY OTP ================= */

app.post("/api/verify-otp", (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) return res.status(400).json({ message: "OTP required" });

    if (Date.now() > otpExpiry)
      return res.status(400).json({ message: "OTP expired" });

    if (parseInt(otp) !== storedOTP)
      return res.status(400).json({ message: "Invalid OTP" });

    isVerified = true;

    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
});

/* ================= FILE UPLOAD ================= */

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});

const upload = multer({ storage });

/* ================= UPLOAD JOBS (EXCEL → MYSQL) ================= */

app.post("/api/upload-jobs", upload.single("file"), (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    let data = xlsx.utils.sheet_to_json(sheet);

    data = data.map((job) => ({
      jobrole: job["Job Role"],
      joblocation: job["Location"],
      jobtype: job["Job Type"],
      jobdescription: job["descrption"] || "No description provided",
    }));

    const query = `
      INSERT INTO jobs (jobrole, joblocation, jobtype, jobdescription)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      jobtype = VALUES(jobtype),
      jobdescription = VALUES(jobdescription),
      updated_at = CURRENT_TIMESTAMP
    `;

    data.forEach((job) => {
      db.query(query, [
        job.jobrole,
        job.joblocation,
        job.jobtype,
        job.jobdescription,
      ]);
    });

    res.json({
      success: true,
      message: "Excel uploaded & jobs updated successfully",
      totalJobs: data.length,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

/* ================= GET JOBS ================= */

app.get("/api/jobs", (req, res) => {
  const query = "SELECT * FROM jobs ORDER BY updated_at DESC";

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "DB error" });
    }

    res.json({
      success: true,
      jobs: results,
    });
  });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
