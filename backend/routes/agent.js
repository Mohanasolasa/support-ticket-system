const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

const router = express.Router();

router.get(
    "/tickets",
    authenticateToken,
    authorizeRoles("agent"),
    async (req, res) => {
        try {
            const [tickets] = await pool.execute(
                `SELECT
          t.id,
          t.subject,
          t.description,
          t.priority,
          t.status,
          t.user_id,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          u.name AS customer_name,
          u.email AS customer_email
        FROM tickets t
        INNER JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC`
            );

            res.json(tickets);
        } catch (error) {
            console.error("Agent ticket listing error:", error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

router.put(
    "/tickets/:id/assign",
    authenticateToken,
    authorizeRoles("agent"),
    async (req, res) => {
        try {
            const { id } = req.params;

            const [tickets] = await pool.execute(
                "SELECT id FROM tickets WHERE id = ?",
                [id]
            );

            if (tickets.length === 0) {
                return res.status(404).json({
                    message: "Ticket not found",
                });
            }

            await pool.execute(
                "UPDATE tickets SET assigned_to = ? WHERE id = ?",
                [req.user.id, id]
            );

            res.json({
                message: "Ticket assigned successfully",
                ticketId: Number(id),
                assignedTo: req.user.id,
            });
        } catch (error) {
            console.error("Ticket assignment error:", error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

router.put(
    "/tickets/:id/status",
    authenticateToken,
    authorizeRoles("agent"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!["open", "in_progress", "closed"].includes(status)) {
                return res.status(400).json({
                    message: "Invalid status",
                });
            }

            const [tickets] = await pool.execute(
                "SELECT id FROM tickets WHERE id = ?",
                [id]
            );

            if (tickets.length === 0) {
                return res.status(404).json({
                    message: "Ticket not found",
                });
            }

            await pool.execute(
                "UPDATE tickets SET status = ? WHERE id = ?",
                [status, id]
            );

            res.json({
                message: "Ticket status updated successfully",
                ticketId: Number(id),
                status,
            });
        } catch (error) {
            console.error("Ticket status update error:", error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

router.put(
    "/tickets/:id/priority",
    authenticateToken,
    authorizeRoles("agent"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { priority } = req.body;

            if (!["low", "medium", "high"].includes(priority)) {
                return res.status(400).json({
                    message: "Invalid priority",
                });
            }

            const [tickets] = await pool.execute(
                "SELECT id FROM tickets WHERE id = ?",
                [id]
            );

            if (tickets.length === 0) {
                return res.status(404).json({
                    message: "Ticket not found",
                });
            }

            await pool.execute(
                "UPDATE tickets SET priority = ? WHERE id = ?",
                [priority, id]
            );

            res.json({
                message: "Ticket priority updated successfully",
                ticketId: Number(id),
                priority,
            });
        } catch (error) {
            console.error("Ticket priority update error:", error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

router.post(
    "/tickets/:id/comments",
    authenticateToken,
    authorizeRoles("agent"),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { comment } = req.body;

            if (!comment) {
                return res.status(400).json({
                    message: "Comment is required",
                });
            }

            const [tickets] = await pool.execute(
                "SELECT id FROM tickets WHERE id = ?",
                [id]
            );

            if (tickets.length === 0) {
                return res.status(404).json({
                    message: "Ticket not found",
                });
            }

            const [result] = await pool.execute(
                `INSERT INTO ticket_comments
         (ticket_id, user_id, comment)
         VALUES (?, ?, ?)`,
                [id, req.user.id, comment]
            );

            res.status(201).json({
                message: "Agent comment added successfully",
                commentId: result.insertId,
            });
        } catch (error) {
            console.error("Agent comment error:", error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

router.get(
    "/tickets/:id",
    authenticateToken,
    authorizeRoles("agent"),
    async (req, res) => {
        try {
            const { id } = req.params;

            const [tickets] = await pool.execute(
                `SELECT
          t.id,
          t.subject,
          t.description,
          t.priority,
          t.status,
          t.user_id,
          t.assigned_to,
          t.created_at,
          t.updated_at,
          u.name AS customer_name,
          u.email AS customer_email
        FROM tickets t
        INNER JOIN users u ON t.user_id = u.id
        WHERE t.id = ?`,
                [id]
            );

            if (tickets.length === 0) {
                return res.status(404).json({
                    message: "Ticket not found",
                });
            }

            res.json(tickets[0]);
        } catch (error) {
            console.error("Agent ticket detail error:", error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

router.get(
    "/tickets/:id/comments",
    authenticateToken,
    authorizeRoles("agent"),
    async (req, res) => {
        try {
            const { id } = req.params;

            const [tickets] = await pool.execute(
                "SELECT id FROM tickets WHERE id = ?",
                [id]
            );

            if (tickets.length === 0) {
                return res.status(404).json({
                    message: "Ticket not found",
                });
            }

            const [comments] = await pool.execute(
                `SELECT
          c.id,
          c.comment,
          c.created_at,
          u.id AS user_id,
          u.name AS user_name,
          u.role AS user_role
        FROM ticket_comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.ticket_id = ?
        ORDER BY c.created_at ASC`,
                [id]
            );

            res.json(comments);
        } catch (error) {
            console.error("Agent comment listing error:", error);

            res.status(500).json({
                message: "Internal server error",
            });
        }
    }
);

module.exports = router;