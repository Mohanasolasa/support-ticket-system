const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../db");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !name.trim() ||
            !email.trim() ||
            !password.trim()
        ) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        const normalizedEmail = email.trim();

        const userRole = "customer";

        const [existingUsers] = await pool.execute(
            "SELECT id FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            [name.trim(), normalizedEmail, passwordHash, userRole]
        );

        res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId,
        });
    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            !email ||
            !password ||
            !email.trim() ||
            !password.trim()
        ) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim();

        const [users] = await pool.execute(
            "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
            [normalizedEmail]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

module.exports = router;