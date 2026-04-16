const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

/* ================= CORS ================= */
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

/* ================= DB ================= */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "leaves_app",
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("DB Connected");
});

/* ================= JWT ================= */
const SECRET = "secure_access_token_key";

/* ================= VERIFY TOKEN ================= */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.json({ success: false, message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.json({ success: false, message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
  const { name, password } = req.body;

  const sql = "SELECT * FROM login WHERE name=? AND password=? LIMIT 1";

  db.query(sql, [name, password], (err, result) => {
    if (err) return res.json({ success: false, message: "DB error" });

    if (result.length > 0) {
      const user = result[0];

      const token = jwt.sign({ id: user.id, role: user.role }, SECRET, {
        expiresIn: "1d",
      });

      return res.json({
        success: true,
        token,
        role: user.role,
      });
    }

    return res.json({ success: false, message: "Invalid login" });
  });
});

/* ================= CREATE EMPLOYEE (FIXED COUNTER SYSTEM) ================= */
app.post("/create-employee", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({ success: false, message: "Access denied" });
  }

  const { name, email, password, department, sub_department, employee_type } =
    req.body;

  const sql = `
    INSERT INTO login
    (name, email, password, role, department, sub_department, employee_type)
    VALUES (?, ?, ?, 'employee', ?, ?, ?)
  `;

  db.query(
    sql,
    [name, email, password, department, sub_department, employee_type],
    (err, result) => {
      if (err) return res.json({ success: false });

      const insertedId = result.insertId;

      // 🔥 STEP 1: increase counter
      db.query(
        "UPDATE employee_counter SET last_number = last_number + 1 WHERE id = 1",
        (err1) => {
          if (err1) return res.json({ success: false });

          // 🔥 STEP 2: get counter value
          db.query(
            "SELECT last_number FROM employee_counter WHERE id = 1",
            (err2, rows) => {
              if (err2) return res.json({ success: false });

              const num = rows[0].last_number;
              const employee_code = "EMP" + String(num).padStart(3, "0");

              // 🔥 STEP 3: update employee_id
              db.query(
                "UPDATE login SET employee_id=? WHERE id=?",
                [employee_code, insertedId],
                () => {
                  return res.json({
                    success: true,
                    employee_id: employee_code,
                  });
                },
              );
            },
          );
        },
      );
    },
  );
});

/* ================= GET ALL EMPLOYEES ================= */
app.get("/employees", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  const sql = `
    SELECT id, employee_id, name, email, department, sub_department, employee_type
    FROM login
    WHERE role = 'employee'
    ORDER BY id ASC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    return res.json({
      success: true,
      employees: result,
    });
  });
});

/* ================= GET ONE EMPLOYEE ================= */
app.get("/employee/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({ success: false, message: "Access denied" });
  }

  const sql = `
    SELECT 
      id,
      employee_id,
      name,
      email,
      department,
      sub_department,
      employee_type,
      profile_pic
    FROM login
    WHERE id=?
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.json({ success: false, message: "DB error" });

    return res.json({
      success: true,
      employee: result[0],
    });
  });
});

/* ================= UPDATE EMPLOYEE ================= */
app.put("/update-employee/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({ success: false, message: "Access denied" });
  }

  const { name, email, department, sub_department, employee_type } = req.body;

  db.query(
    `UPDATE login SET name=?, email=?, department=?, sub_department=?, employee_type=? WHERE id=?`,
    [name, email, department, sub_department, employee_type, req.params.id],
    (err) => {
      if (err) {
        return res.json({ success: false, message: "Update failed" });
      }

      return res.json({
        success: true,
        message: "Employee updated",
      });
    },
  );
});

/* ================= DELETE EMPLOYEE ================= */
app.delete("/delete-employee/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied",
    });
  }

  db.query("DELETE FROM login WHERE id=?", [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Delete failed",
      });
    }

    return res.json({
      success: true,
      message: "Employee deleted",
    });
  });
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
