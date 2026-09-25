const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticateToken, async (req, res) => {
    try {
        const { subject, description, priority } = req.body;

        if (!subject) {
            return res.status(400).json({
                message: "Subject is required",
            });
        }

        const ticketPriority = priority || "medium";

        if (!["low", "medium", "high"].includes(ticketPriority)) {
            return res.status(400).json({
                message: "Invalid priority",
            });
        }

        const [result] = await pool.execute(
            `INSERT INTO tickets
       (user_id, subject, description, priority)
       VALUES (?, ?, ?, ?)`,
            [req.user.id, subject, description || null, ticketPriority]
        );

        res.status(201).json({
            message: "Ticket created successfully",
            ticketId: result.insertId,
        });
    } catch (error) {
        console.error("Ticket creation error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.get("/", authenticateToken, async (req, res) => {
    try {
        const [tickets] = await pool.execute(
            `SELECT
        t.id,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.assigned_to,
        t.created_at,
        t.updated_at,
        u.name AS customer_name,
        u.email AS customer_email
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC`,
            [req.user.id]
        );

        res.json(tickets);
    } catch (error) {
        console.error("Ticket listing error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.get("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [tickets] = await pool.execute(
            `SELECT
        t.id,
        t.subject,
        t.description,
        t.priority,
        t.status,
        t.assigned_to,
        t.created_at,
        t.updated_at,
        u.name AS customer_name,
        u.email AS customer_email
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.id = ? AND t.user_id = ?`,
            [id, req.user.id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        res.json(tickets[0]);
    } catch (error) {
        console.error("Ticket detail error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.put("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { subject, description, priority } = req.body;

        const [tickets] = await pool.execute(
            "SELECT id FROM tickets WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        if (priority && !["low", "medium", "high"].includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority",
            });
        }

        const [result] = await pool.execute(
            `UPDATE tickets
       SET subject = COALESCE(?, subject),
           description = COALESCE(?, description),
           priority = COALESCE(?, priority)
       WHERE id = ? AND user_id = ?`,
            [
                subject || null,
                description || null,
                priority || null,
                id,
                req.user.id,
            ]
        );

        res.json({
            message: "Ticket updated successfully",
            affectedRows: result.affectedRows,
        });
    } catch (error) {
        console.error("Ticket update error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const [tickets] = await pool.execute(
            "SELECT id FROM tickets WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                message: "Ticket not found",
            });
        }

        await pool.execute(
            "DELETE FROM tickets WHERE id = ? AND user_id = ?",
            [id, req.user.id]
        );

        res.json({
            message: "Ticket deleted successfully",
        });
    } catch (error) {
        console.error("Ticket deletion error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});
module.exports = router;