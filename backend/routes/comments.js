const express = require("express");

const pool = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

const addComment = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({
                message: "Comment is required",
            });
        }

        const [tickets] = await pool.execute(
            "SELECT id FROM tickets WHERE id = ? AND user_id = ?",
            [ticketId, req.user.id]
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
            [ticketId, req.user.id, comment]
        );

        res.status(201).json({
            message: "Comment added successfully",
            commentId: result.insertId,
        });
    } catch (error) {
        console.error("Comment creation error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

const getComments = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const [tickets] = await pool.execute(
            "SELECT id FROM tickets WHERE id = ? AND user_id = ?",
            [ticketId, req.user.id]
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
            [ticketId]
        );

        res.json(comments);
    } catch (error) {
        console.error("Comment listing error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
};

/*
 * Existing customer comment routes.
 * These are preserved for backward compatibility with the current frontend.
 */
router.post("/:ticketId", authenticateToken, addComment);
router.get("/:ticketId", authenticateToken, getComments);

module.exports = {
    router,
    addComment,
    getComments,
};