import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import client from "../../api/client";
import Navbar from "../Navbar";
import TicketComments from "../TicketComments";

import "./index.css";

function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [ticket, setTicket] = useState(null);

    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        priority: "medium",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await client.get(`/tickets/${id}`);
                const ticketData = response.data.ticket || response.data;

                setTicket(ticketData);

                setFormData({
                    subject: ticketData.subject || "",
                    description: ticketData.description || "",
                    priority: ticketData.priority || "medium",
                });
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load ticket"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (
            !formData.subject.trim() ||
            !formData.description.trim()
        ) {
            setError("Subject and description are required");
            return;
        }

        try {
            setSaving(true);

            const response = await client.put(`/tickets/${id}`, {
                subject: formData.subject.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
            });

            const updatedTicket =
                response.data.ticket || response.data;

            setTicket(updatedTicket);

            setFormData({
                subject: updatedTicket.subject || "",
                description: updatedTicket.description || "",
                priority: updatedTicket.priority || "medium",
            });

            setSuccess("Ticket updated successfully");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to update ticket"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this ticket?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleting(true);
            setError("");

            await client.delete(`/tickets/${id}`);

            navigate("/customer/tickets");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to delete ticket"
            );
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="ticket-details">
                    <div className="ticket-details__content">
                        <p className="ticket-details__loading">
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

                <main className="ticket-details">
                    <div className="ticket-details__content">
                        <p className="ticket-details__error">
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

            <main className="ticket-details">
                <div className="ticket-details__content">
                    <header className="ticket-details__header">
                        <div>
                            <h1>{ticket.subject}</h1>

                            <p>Ticket #{ticket.id}</p>
                        </div>

                        <div className="ticket-details__actions">
                            <button
                                className="ticket-details__button"
                                type="button"
                                onClick={() => navigate("/customer/tickets")}
                            >
                                Back
                            </button>

                            <button
                                className="ticket-details__button ticket-details__button--danger"
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </header>

                    {error && (
                        <p className="ticket-details__error">{error}</p>
                    )}

                    {success && (
                        <p className="ticket-details__success">{success}</p>
                    )}

                    <section className="ticket-details__card">
                        <div className="ticket-details__meta">
                            <span className="ticket-details__badge">
                                Priority: {ticket.priority}
                            </span>

                            <span className="ticket-details__badge">
                                Status: {ticket.status}
                            </span>
                        </div>

                        <p className="ticket-details__description">
                            {ticket.description}
                        </p>

                        <form
                            className="ticket-details__edit"
                            onSubmit={handleUpdate}
                        >
                            <div className="ticket-details__field">
                                <label htmlFor="subject">Subject</label>

                                <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="ticket-details__field">
                                <label htmlFor="description">
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="ticket-details__field">
                                <label htmlFor="priority">Priority</label>

                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            <button
                                className="ticket-details__edit-button"
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </form>
                    </section>

                    <TicketComments ticketId={id} />
                </div>
            </main>
        </>
    );
}

export default TicketDetails;