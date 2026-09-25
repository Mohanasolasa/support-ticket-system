import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import client from "../../api/client";
import Navbar from "../Navbar";

import "./index.css";

function AgentDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await client.get("/agent/tickets");

                setTickets(response.data.tickets || response.data);
            } catch (error) {
                setError(
                    error.response?.data?.message ||
                    "Unable to load tickets"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, []);

    return (
        <>
            <Navbar />

            <main className="agent-dashboard">
                <div className="agent-dashboard__content">
                    <header className="agent-dashboard__header">
                        <h1>Agent Dashboard</h1>

                        <p>
                            View and manage customer support tickets.
                        </p>
                    </header>

                    {error && (
                        <p className="agent-dashboard__error">{error}</p>
                    )}

                    {loading ? (
                        <p className="agent-dashboard__loading">
                            Loading tickets...
                        </p>
                    ) : tickets.length === 0 ? (
                        <div className="agent-dashboard__empty">
                            <p>No tickets found.</p>
                        </div>
                    ) : (
                        <section className="agent-dashboard__list">
                            {tickets.map((ticket) => (
                                <article
                                    className="agent-dashboard__item"
                                    key={ticket.id}
                                >
                                    <h2>{ticket.subject}</h2>

                                    <p className="agent-dashboard__customer">
                                        Customer:{" "}
                                        {ticket.customer_name ||
                                            ticket.name ||
                                            ticket.email ||
                                            "Unknown"}
                                    </p>

                                    <div className="agent-dashboard__meta">
                                        <span className="agent-dashboard__badge">
                                            Priority: {ticket.priority}
                                        </span>

                                        <span className="agent-dashboard__badge">
                                            Status: {ticket.status}
                                        </span>

                                        <span className="agent-dashboard__badge">
                                            Assigned to:{" "}
                                            {ticket.agent_name || "Unassigned"}
                                        </span>
                                    </div>

                                    <Link
                                        className="agent-dashboard__view-button"
                                        to={`/agent/tickets/${ticket.id}`}
                                    >
                                        View Details
                                    </Link>
                                </article>
                            ))}
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}

export default AgentDashboard;