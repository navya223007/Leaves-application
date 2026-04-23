const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
<<<<<<< HEAD
app.use(cors());
app.use(express.json());

=======

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
>>>>>>> 46ee1f274c5f268f47c5e27e9a5fb942d1afcd5c
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
<<<<<<< HEAD
  database: "leave_system",
});

// Login API
app.post("/login", (req, res) => {
  const { emp_id, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE emp_id=? AND password=?",
    [emp_id, password],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = result[0];

      const token = jwt.sign({ id: user.id, role: user.role }, "secretkey", {
        expiresIn: "1d",
      });

      res.json({
        token,
        user: {
          id: user.id,
          emp_id: user.emp_id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      });
    },
  );
});

app.post("/create-employees", (req, res) => {
  const {
    emp_id,
    name,
    email,
    password,
    role,
    department,
    employeeType,
    subDepartment,
  } = req.body;

  // ✅ validation (IMPORTANT)
  if (!emp_id || !name || !email || !password) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  const sql =
    "INSERT INTO users (emp_id, name, email, password, role, department, employeeType, subDepartment) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    sql,
    [
      emp_id,
      name,
      email,
      password,
      role,
      department,
      employeeType,
      subDepartment,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        return res
          .status(500)
          .json({ message: "Error creating employee", err });
      }

      res.json({ message: "Employee created successfully" });
    },
  );
});

app.get("/employees-reports", (req, res) => {
  const sql =
    "SELECT id, emp_id, name, email, role, department, subDepartment, employeeType FROM users";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error fetching employees" });
    }

    res.json(result);
  });
});
// 🟢 DELETE API
app.delete("/employees/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM users WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Employee deleted successfully" });
  });
});

// 🟡 GET SINGLE EMPLOYEE (for edit page)
app.get("/employees/:id", (req, res) => {
  const id = req.params.id;

  if (!id) {
    return res.status(400).json({ message: "ID is required" });
  }

  db.query("SELECT * FROM users WHERE id=?", [id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(result[0]);
  });
});
// 🟠 UPDATE API
app.put("/employees/:id", (req, res) => {
  const id = req.params.id;

  const { emp_id, name, email, role, department, subDepartment, employeeType } =
    req.body;

  const sql =
    "UPDATE users SET emp_id=?, name=?, email=?, role=?, department=?, subDepartment=?, employeeType=? WHERE id=?";

  db.query(
    sql,
    [emp_id, name, email, role, department, subDepartment, employeeType, id],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Update failed" });
      }

      res.json({ message: "Updated successfully" });
=======
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
>>>>>>> 46ee1f274c5f268f47c5e27e9a5fb942d1afcd5c
    },
  );
});

<<<<<<< HEAD
// ================= 1. APPLY LEAVE =================
// ================= APPLY LEAVE =================
app.post("/api/leaves/apply", (req, res) => {
  const d = req.body;

  const sql = `
    INSERT INTO leaves
    (emp_id, name, department, leave_type, sub_type, date, selected_dates, session, reason_type, reason_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    d.emp_id || null,
    d.name || null,
    d.department || null,
    d.leave_type || null,
    d.sub_type || null,
    d.date || null,
    JSON.stringify(d.selected_dates || []),
    d.session || null,
    d.reason_type || null,
    d.reason_text || null,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.log("DB ERROR:", err);
      return res.status(500).json({
        message: "Leave insert failed",
        error: err.message,
      });
    }

    res.json({
      message: "Leave applied successfully",
      id: result.insertId,
    });
  });
});

app.get("/api/leaves/employee/:emp_id", (req, res) => {
  const emp_id = req.params.emp_id;

  const sql = `
    SELECT * FROM leaves
    WHERE emp_id = ?
    AND (employee_checked IS NULL OR employee_checked = 0)
    ORDER BY id DESC
  `;

  db.query(sql, [emp_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
});
app.put("/api/leaves/update/:id", (req, res) => {
  const id = req.params.id;
  const d = req.body;

  const sql = `
    UPDATE leaves
    SET emp_id=?, name=?, department=?, leave_type=?, sub_type=?,
        date=?, selected_dates=?, session=?, reason_type=?, reason_text=?
    WHERE id=?
  `;

  const values = [
    d.emp_id,
    d.name,
    d.department,
    d.leave_type,
    d.sub_type,
    d.date,
    JSON.stringify(d.selected_dates || []),
    d.session,
    d.reason_type,
    d.reason_text,
    id,
  ];

  db.query(sql, values, (err) => {
    if (err) {
      return res.status(500).json({
        message: "Update failed",
        error: err.message,
      });
    }

    res.json({ message: "Leave updated successfully" });
  });
});

app.put("/api/leaves/approve/:id", (req, res) => {
  const id = req.params.id;

  const sql = `
    UPDATE leaves 
    SET 
      status='approved',
      approved_at = NOW(),
      reject_reason = NULL
    WHERE id=?
  `;

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Leave approved",
    });
  });
});
app.put("/api/leaves/reject/:id", (req, res) => {
  const id = req.params.id;
  const { reason } = req.body;

  const sql = `
    UPDATE leaves
    SET 
      status='rejected',
      reject_reason=?,
      approved_at = NULL
    WHERE id=?
  `;

  db.query(sql, [reason, id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "Leave rejected",
    });
  });
});
app.get("/api/leaves/pending", (req, res) => {
  db.query(
    "SELECT * FROM leaves WHERE status='pending' ORDER BY id DESC",
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    },
  );
});
// ================= REUSABLE REPORT API =================

// ================= REPORT API =================

// ================= REPORT API =================

app.get("/api/leaves/report", (req, res) => {
  console.log(req.query);
  const { role, emp_id, month, status } = req.query;

  let sql = `
    SELECT
      id,
      emp_id,
      name,
      department,
      leave_type,
      created_at,
      reason_type,
      reason_text,
      date,
      status,
      reject_reason
    FROM leaves
    WHERE 1=1
  `;

  const params = [];

  // EMPLOYEE LOGIN

  if (role === "employee") {
    sql += " AND emp_id = ?";
    params.push(emp_id);
  }

  // ADMIN SELECTED EMPLOYEE

  if (role === "admin" && emp_id && emp_id !== "all") {
    sql += " AND emp_id = ?";
    params.push(emp_id);
  }

  // MONTH FILTER (IMPORTANT)

  if (month && month !== "all") {
    sql += " AND MONTH(created_at) = ?";
    params.push(month);
  }

  // STATUS FILTER

  if (status && status !== "all") {
    sql += " AND status = ?";
    params.push(status);
  }

  sql += " ORDER BY created_at DESC";

  console.log("SQL:", sql);
  console.log("Params:", params);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log("Report error:", err);
      return res.status(500).json({
        message: "Report failed",
      });
    }

    res.json(result);
  });
});
app.put("/api/leaves/mark-read/:id", (req, res) => {
  const id = req.params.id;

  db.query("UPDATE leaves SET employee_checked=1 WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Marked as read" });
  });
});

app.get("/api/dashboard/admin-counts", (req, res) => {
  const sql = `
    SELECT 
      SUM(status = 'pending') AS pending,
      SUM(status = 'approved') AS approved,
      SUM(status = 'rejected') AS rejected
    FROM leaves
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result[0]);
  });
});

// =================  REPORT =================

const PORT = 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
=======
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
>>>>>>> 46ee1f274c5f268f47c5e27e9a5fb942d1afcd5c
});
