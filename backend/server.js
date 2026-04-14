const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

/* =========================
   CORS CONFIG
========================= */

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

/* =========================
   DATABASE CONNECTION
========================= */

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456789",
  database: "leaves_app",
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Database connected");
  }
});

/* =========================
   JWT SECRET KEY
========================= */

const ACCESS_TOKEN_SECRET = "secure_access_token_key";

/* =========================
   VERIFY TOKEN
========================= */

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.json({
      success: false,
      message: "No token provided",
    });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = decoded;
    next();
  });
};

/* =========================
   LOGIN API
========================= */

app.post("/login", (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.json({
      success: false,
      message: "Username and password required",
    });
  }

  const sql = "SELECT * FROM login WHERE name=? AND password=?";

  db.query(sql, [name, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Database error",
      });
    }

    if (result.length > 0) {
      const user = result[0];

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" },
      );

      return res.json({
        success: true,
        token: token,
        role: user.role,
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid username or password",
      });
    }
  });
});

/* =========================
   GENERATE EMPLOYEE ID
========================= */

const generateEmployeeId = (callback) => {
  const sql =
    "SELECT employee_id FROM login WHERE employee_id IS NOT NULL ORDER BY id DESC LIMIT 1";

  db.query(sql, (err, result) => {
    if (err) {
      return callback(err, null);
    }

    let newId = "EMP001";

    if (result.length > 0 && result[0].employee_id) {
      const lastId = result[0].employee_id;

      const number = parseInt(lastId.replace("EMP", ""));

      const nextNumber = number + 1;

      newId = "EMP" + String(nextNumber).padStart(3, "0");
    }

    callback(null, newId);
  });
};

/* =========================
   CREATE EMPLOYEE ADMIN ONLY
========================= */

app.post("/create-employee", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({
      success: false,
      message: "Access denied",
    });
  }

  const { name, email, password, department, sub_department } = req.body;

  if (!name || !email || !password || !department) {
    return res.json({
      success: false,
      message: "All fields are required",
    });
  }

  generateEmployeeId((err, employee_id) => {
    if (err) {
      console.log(err);

      return res.json({
        success: false,
        message: "ID generation failed",
      });
    }

    const sql =
      "INSERT INTO login (employee_id, name, email, password, role, department, sub_department) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(
      sql,
      [
        employee_id,
        name,
        email,
        password,
        "employee",
        department,
        sub_department,
      ],
      (err, result) => {
        if (err) {
          console.log(err);

          return res.json({
            success: false,
            message: "Database error",
          });
        }

        return res.json({
          success: true,
          message: "Employee created successfully",
          employee_id: employee_id,
        });
      },
    );
  });
});

/* =========================
   GET EMPLOYEES ADMIN ONLY
========================= */

app.get("/employees", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({
      success: false,
      message: "Access denied",
    });
  }

  const sql =
    "SELECT id, employee_id, name, email, department, role FROM login WHERE role='employee'";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);

      return res.json({
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

/* =========================
   GET SINGLE EMPLOYEE
========================= */

app.get("/employee/:id", verifyToken, (req, res) => {
  const id = req.params.id;

  const sql = "SELECT * FROM login WHERE id=?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);

      return res.json({
        success: false,
      });
    }

    return res.json({
      success: true,
      data: result[0],
    });
  });
});

/* =========================
   UPDATE EMPLOYEE ADMIN ONLY
========================= */

app.put("/update-employee/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({
      success: false,
      message: "Access denied",
    });
  }

  const id = req.params.id;

  const { employee_id, name, email, password, department, sub_department } =
    req.body;

  const sql =
    "UPDATE login SET employee_id=?, name=?, email=?, password=?, department=?, sub_department=? WHERE id=?";

  db.query(
    sql,
    [employee_id, name, email, password, department, sub_department, id],
    (err, result) => {
      if (err) {
        console.log(err);

        return res.json({
          success: false,
          message: "Update failed",
        });
      }

      return res.json({
        success: true,
        message: "Employee updated",
      });
    },
  );
});

/* =========================
   DELETE EMPLOYEE ADMIN ONLY
========================= */

app.delete("/delete-employee/:id", verifyToken, (req, res) => {
  if (req.user.role !== "admin") {
    return res.json({
      success: false,
      message: "Access denied",
    });
  }

  const id = req.params.id;

  const sql = "DELETE FROM login WHERE id=?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);

      return res.json({
        success: false,
        message: "Delete failed",
      });
    }

    return res.json({
      success: true,
    });
  });
});

/* =========================
   SERVER START
========================= */

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
