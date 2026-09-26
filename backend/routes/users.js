const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    authorizeRoles("agent"),
    async (req, res) => {
        try {
            const [users] = await pool.execute(
                `SELECT
          id,
          name,
          email,
          role,
          created_at
        FROM users
        ORDER BY created_at DESC`
            );

            res.json(users);
        } catch (error) {
            console.error("User listing error:", error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

module.exports = router;