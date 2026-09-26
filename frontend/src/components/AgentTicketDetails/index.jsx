import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import client from "../../api/client";
import Navbar from "../Navbar";

import "./index.css";

function AgentTicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);
    const [comments, setComments] = useState([]);

    const [status, setStatus] = useState("open");
    const [priority, setPriority] = useState("medium");
    const [comment, setComment] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchTicket = async () => {
        const response = await client.get(`/agent/tickets/${id}`);
        const ticketData = response.data.ticket || response.data;

        setTicket(ticketData);
        setStatus(ticketData.status);
        setPriority(ticketData.priority);
    };

    const fetchComments = async () => {
        const response = await client.get(
            `/agent/tickets/${id}/comments`
        );

        setComments(response.data.comments || response.data);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                await Promise.all([
                    fetchTicket(),
                    fetchComments(),
                ]);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load ticket"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleAssign = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await client.put(`/agent/tickets/${id}/assign`);

            await fetchTicket();

            setSuccess("Ticket assigned successfully");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to assign ticket"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (event) => {
        const newStatus = event.target.value;

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await client.put(`/agent/tickets/${id}/status`, {
                status: newStatus,
            });

            setStatus(newStatus);

            await fetchTicket();

            setSuccess("Ticket status updated successfully");
        } catch (error) {
            setStatus(ticket?.status || "open");

            setError(
                error.response?.data?.message ||
                "Unable to update ticket status"
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePriorityChange = async (event) => {
        const newPriority = event.target.value;

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await client.put(`/agent/tickets/${id}/priority`, {
                priority: newPriority,
            });

            setPriority(newPriority);

            await fetchTicket();

            setSuccess("Ticket priority updated successfully");
        } catch (error) {
            setPriority(ticket?.priority || "medium");

            setError(
                error.response?.data?.message ||
                "Unable to update ticket priority"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCommentSubmit = async (event) => {
        event.preventDefault();

        if (!comment.trim()) {
            setError("Comment is required");
            return;
        }

        try {
            setSubmittingComment(true);
            setError("");
            setSuccess("");

            await client.post(`/agent/tickets/${id}/comments`, {
                comment: comment.trim(),
            });

            setComment("");

            await fetchComments();

            setSuccess("Comment added successfully");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to add comment"
            );
        } finally {
            setSubmittingComment(false);
        }
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "Not available";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toLocaleString();
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="agent-ticket-details">
                    <div className="agent-ticket-details__content">
                        <p className="agent-ticket-details__loading">
                            Loading ticket...
                        </p>
                    </div>
                </main>
            </>
        );
    }

    if (!ticket) {
        return (
            <>
                <Navbar />

                <main className="agent-ticket-details">
                    <div className="agent-ticket-details__content">
                        <p className="agent-ticket-details__error">
                            {error || "Ticket not found"}
                        </p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="agent-ticket-details">
                <div className="agent-ticket-details__content">
                    <header className="agent-ticket-details__header">
                        <div>
                            <h1>{ticket.subject}</h1>
                            <p>Ticket #{ticket.id}</p>
                        </div>

                        <button
                            className="agent-ticket-details__back-button"
                            type="button"
                            onClick={() => navigate("/agent")}
                        >
                            Back to Dashboard
                        </button>
                    </header>

                    {error && (
                        <p className="agent-ticket-details__error">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="agent-ticket-details__success">
                            {success}
                        </p>
                    )}

                    <section className="agent-ticket-details__card">
                        <div className="agent-ticket-details__meta">
                            <span className="agent-ticket-details__badge">
                                Priority: {ticket.priority}
                            </span>

                            <span className="agent-ticket-details__badge">
                                Status: {ticket.status}
                            </span>

                            <span className="agent-ticket-details__badge">
                                Assigned to:{" "}
                                {ticket.agent_name || "Unassigned"}
                            </span>
                        </div>

                        <div className="agent-ticket-details__dates">
                            <p>
                                <strong>Created:</strong>{" "}
                                {formatDateTime(ticket.created_at)}
                            </p>

                            <p>
                                <strong>Last Updated:</strong>{" "}
                                {formatDateTime(ticket.updated_at)}
                            </p>
                        </div>

                        <p className="agent-ticket-details__description">
                            {ticket.description}
                        </p>

                        <div className="agent-ticket-details__customer">
                            <strong>Customer</strong>

                            <p>
                                Name:{" "}
                                {ticket.customer_name ||
                                    ticket.name ||
                                    "Unknown"}
                            </p>

                            <p>
                                Email:{" "}
                                {ticket.customer_email || "Unknown"}
                            </p>
                        </div>

                        <div className="agent-ticket-details__controls">
                            <div className="agent-ticket-details__field">
                                <label htmlFor="status">
                                    Status
                                </label>

                                <select
                                    id="status"
                                    value={status}
                                    onChange={handleStatusChange}
                                    disabled={saving}
                                >
                                    <option value="open">
                                        Open
                                    </option>

                                    <option value="in_progress">
                                        In Progress
                                    </option>

                                    <option value="closed">
                                        Closed
                                    </option>
                                </select>
                            </div>

                            <div className="agent-ticket-details__field">
                                <label htmlFor="priority">
                                    Priority
                                </label>

                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={handlePriorityChange}
                                    disabled={saving}
                                >
                                    <option value="low">
                                        Low
                                    </option>

                                    <option value="medium">
                                        Medium
                                    </option>

                                    <option value="high">
                                        High
                                    </option>
                                </select>
                            </div>

                            <div className="agent-ticket-details__field">
                                <label>Assignment</label>

                                <button
                                    className="agent-ticket-details__button"
                                    type="button"
                                    onClick={handleAssign}
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Assign to Me"}
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="agent-ticket-details__comments">
                        <h2>Comments</h2>

                        {comments.length === 0 ? (
                            <p>No comments yet.</p>
                        ) : (
                            <div className="agent-ticket-details__comment-list">
                                {comments.map((item) => (
                                    <article
                                        className="agent-ticket-details__comment"
                                        key={item.id}
                                    >
                                        <p>{item.comment}</p>

                                        <span className="agent-ticket-details__comment-date">
                                            {item.created_at
                                                ? new Date(
                                                    item.created_at
                                                ).toLocaleString()
                                                : ""}
                                        </span>
                                    </article>
                                ))}
                            </div>
                        )}

                        <form
                            className="agent-ticket-details__comment-form"
                            onSubmit={handleCommentSubmit}
                        >
                            <textarea
                                value={comment}
                                onChange={(event) =>
                                    setComment(event.target.value)
                                }
                                placeholder="Add an agent comment..."
                            />

                            <button
                                className="agent-ticket-details__button"
                                type="submit"
                                disabled={submittingComment}
                            >
                                {submittingComment
                                    ? "Adding..."
                                    : "Add Comment"}
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </>
    );
}

export default AgentTicketDetails;