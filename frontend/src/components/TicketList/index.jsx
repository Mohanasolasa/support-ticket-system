import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import client from "../../api/client";
import Navbar from "../Navbar";

import "./index.css";

function TicketList() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

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

    const filteredTickets = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return tickets.filter((ticket) => {
            const matchesSearch =
                !normalizedSearch ||
                ticket.subject?.toLowerCase().includes(normalizedSearch) ||
                ticket.description
                    ?.toLowerCase()
                    .includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "all" ||
                ticket.status === statusFilter;

            const matchesPriority =
                priorityFilter === "all" ||
                ticket.priority === priorityFilter;

            return matchesSearch && matchesStatus && matchesPriority;
        });
    }, [tickets, search, statusFilter, priorityFilter]);

    const hasActiveFilters =
        search.trim() ||
        statusFilter !== "all" ||
        priorityFilter !== "all";

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setPriorityFilter("all");
    };

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

                    {!loading && tickets.length > 0 && (
                        <section className="ticket-list__filters">
                            <div className="ticket-list__filter-field ticket-list__filter-field--search">
                                <label htmlFor="ticket-search">
                                    Search
                                </label>

                                <input
                                    id="ticket-search"
                                    type="search"
                                    placeholder="Search by subject or description"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                />
                            </div>

                            <div className="ticket-list__filter-field">
                                <label htmlFor="ticket-status-filter">
                                    Status
                                </label>

                                <select
                                    id="ticket-status-filter"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                >
                                    <option value="all">
                                        All Statuses
                                    </option>
                                    <option value="open">Open</option>
                                    <option value="in_progress">
                                        In Progress
                                    </option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>

                            <div className="ticket-list__filter-field">
                                <label htmlFor="ticket-priority-filter">
                                    Priority
                                </label>

                                <select
                                    id="ticket-priority-filter"
                                    value={priorityFilter}
                                    onChange={(event) =>
                                        setPriorityFilter(event.target.value)
                                    }
                                >
                                    <option value="all">
                                        All Priorities
                                    </option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>

                            {hasActiveFilters && (
                                <button
                                    className="ticket-list__clear-button"
                                    type="button"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </button>
                            )}
                        </section>
                    )}

                    {!loading && tickets.length > 0 && (
                        <p className="ticket-list__result-count">
                            Showing {filteredTickets.length} of{" "}
                            {tickets.length} ticket
                            {tickets.length === 1 ? "" : "s"}
                        </p>
                    )}

                    {loading ? (
                        <p className="ticket-list__loading">
                            Loading tickets...
                        </p>
                    ) : tickets.length === 0 ? (
                        <div className="ticket-list__empty">
                            <p>No tickets found.</p>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="ticket-list__empty">
                            <p>No tickets match your search or filters.</p>

                            <button
                                className="ticket-list__clear-button"
                                type="button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <section className="ticket-list__items">
                            {filteredTickets.map((ticket) => (
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