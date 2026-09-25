import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import client from "../../api/client";
import Navbar from "../Navbar";

import "./index.css";

function TicketList() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await client.get("/tickets");

                setTickets(response.data.tickets || response.data);
            } catch (error) {
                setError(
                    error.response?.data?.message || "Unable to load tickets"
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

            <main className="ticket-list">
                <div className="ticket-list__content">
                    <header className="ticket-list__header">
                        <h1>My Tickets</h1>

                        <Link
                            className="ticket-list__create-button"
                            to="/customer/tickets/create"
                        >
                            Create Ticket
                        </Link>
                    </header>

                    {error && (
                        <p className="ticket-list__error">{error}</p>
                    )}

                    {loading ? (
                        <p className="ticket-list__loading">
                            Loading tickets...
                        </p>
                    ) : tickets.length === 0 ? (
                        <div className="ticket-list__empty">
                            <p>No tickets found.</p>
                        </div>
                    ) : (
                        <section className="ticket-list__items">
                            {tickets.map((ticket) => (
                                <article
                                    className="ticket-list__item"
                                    key={ticket.id}
                                >
                                    <h2>{ticket.subject}</h2>

                                    <p className="ticket-list__description">
                                        {ticket.description}
                                    </p>

                                    <div className="ticket-list__meta">
                                        <span className="ticket-list__badge">
                                            Priority: {ticket.priority}
                                        </span>

                                        <span className="ticket-list__badge">
                                            Status: {ticket.status}
                                        </span>
                                    </div>

                                    <Link
                                        className="ticket-list__view-button"
                                        to={`/customer/tickets/${ticket.id}`}
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

export default TicketList;