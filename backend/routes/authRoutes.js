const express = require("express");
const router = express.Router();
const db = require("../db");

// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM login WHERE email=? AND password=?";

  db.query(sql, [email, password], (err, result) => {
    if (err) return res.send(err);

    if (result.length > 0) {
      res.send({
        success: true,
        role: result[0].role,
      });
    } else {
      res.send({
        success: false,
        message: "Invalid credentials",
      });
    }
  });
});

// ADMIN CREATE EMPLOYEE
router.post("/create-employee", (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO login (name,email,password,role) VALUES (?,?,?,?)";

  db.query(sql, [name, email, password, "employee"], (err, result) => {
    if (err) return res.send(err);

    res.send({
      success: true,
      message: "Employee created",
    });
  });
});

module.exports = router;
