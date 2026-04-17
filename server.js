require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// ===== MYSQL CONNECTION =====
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "career_db",
});

db.connect((err) => {
  if (err) console.log("DB Error:", err);
  else console.log("MySQL Connected");
});

// ===== FILE UPLOAD =====
const upload = multer({ dest: "uploads/" });

// ===== EMAIL SETUP =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(to, subject, text, filePath = null) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  if (filePath) {
    mailOptions.attachments = [{ path: filePath }];
  }

  await transporter.sendMail(mailOptions);
}

// ===== OTP STORE =====
let otpStore = {};

// ===== ADMIN OTP =====
app.post("/api/admin/send-otp", async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  try {
    await sendMail(email, "Admin OTP", `Your OTP is ${otp}`);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: "OTP send failed" });
  }
});

app.post("/api/admin/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ===== PARSE EXCEL =====
function parseExcel(filePath) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // target mail (2nd row)
  const targetMail = data[1][0];

  const jobs = [];

  for (let i = 4; i < data.length; i++) {
    const row = data[i];
    if (!row[1]) continue;

    jobs.push([
      row[1], // role
      row[2], // location
      row[3], // type
      row[4], // description
    ]);
  }

  return { targetMail, jobs };
}

// ===== UPLOAD EXCEL =====
app.post("/api/admin/upload-jobs", upload.single("excelFile"), (req, res) => {
  try {
    const { targetMail, jobs } = parseExcel(req.file.path);

    // Save target email
    db.query("DELETE FROM config", () => {
      db.query("INSERT INTO config (targetmail) VALUES (?)", [targetMail]);
    });

    // Clear old jobs
    db.query("DELETE FROM jobs", () => {
      // Insert new jobs
      jobs.forEach((job) => {
        db.query(
          "INSERT INTO jobs (jobrole, joblocation, jobtype, jobdescription) VALUES (?, ?, ?, ?)",
          job
        );
      });
    });

    res.json({ success: true, message: "Jobs uploaded successfully" });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Excel parse error" });
  }
});

// ===== GET JOBS =====
app.get("/api/jobs", (req, res) => {
  db.query("SELECT * FROM jobs", (err, result) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, jobs: result });
  });
});

// ===== APPLY =====
app.post("/api/apply", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, mobile, selectedJobs } = req.body;

    const roles = JSON.parse(selectedJobs);

    // get HR email
    db.query("SELECT targetmail FROM config LIMIT 1", async (err, result) => {
      if (err || result.length === 0) {
        return res.json({ success: false, message: "No HR email found" });
      }

      const targetMail = result[0].targetmail;

      await sendMail(
        targetMail,
        "New Job Application",
        `
Name: ${name}
Email: ${email}
Mobile: ${mobile}

Applied Roles:
${roles.join(", ")}
        `,
        req.file.path
      );

      res.json({ success: true, message: "Application sent to HR" });
    });
  } catch (err) {
    console.log(err);
    res.json({ success: false, message: "Submission failed" });
  }
});

// ===== START SERVER =====
app.listen(process.env.PORT || 8082, () => {
  console.log(`Server running on port ${process.env.PORT || 8082}`);
});