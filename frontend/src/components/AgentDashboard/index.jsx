import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import client from "../../api/client";
import Navbar from "../Navbar";

import "./index.css";

function AgentDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

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

    const ticketStatistics = useMemo(() => {
        return {
            total: tickets.length,
            open: tickets.filter((ticket) => ticket.status === "open").length,
            inProgress: tickets.filter(
                (ticket) => ticket.status === "in_progress"
            ).length,
            closed: tickets.filter((ticket) => ticket.status === "closed")
                .length,
        };
    }, [tickets]);

    const filteredAndSortedTickets = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        const filteredTickets = tickets.filter((ticket) => {
            const matchesSearch =
                !normalizedSearch ||
                ticket.subject
                    ?.toLowerCase()
                    .includes(normalizedSearch) ||
                ticket.customer_name
                    ?.toLowerCase()
                    .includes(normalizedSearch) ||
                ticket.customer_email
                    ?.toLowerCase()
                    .includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "all" ||
                ticket.status === statusFilter;

            const matchesPriority =
                priorityFilter === "all" ||
                ticket.priority === priorityFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        });

        return [...filteredTickets].sort((first, second) => {
            if (sortBy === "newest") {
                return (
                    new Date(second.created_at || 0) -
                    new Date(first.created_at || 0)
                );
            }

            if (sortBy === "oldest") {
                return (
                    new Date(first.created_at || 0) -
                    new Date(second.created_at || 0)
                );
            }

            if (sortBy === "subject-az") {
                return (first.subject || "").localeCompare(
                    second.subject || ""
                );
            }

            if (sortBy === "subject-za") {
                return (second.subject || "").localeCompare(
                    first.subject || ""
                );
            }

            if (sortBy === "priority") {
                const priorityOrder = {
                    high: 1,
                    medium: 2,
                    low: 3,
                };

                return (
                    (priorityOrder[first.priority] || 99) -
                    (priorityOrder[second.priority] || 99)
                );
            }

            return 0;
        });
    }, [
        tickets,
        search,
        statusFilter,
        priorityFilter,
        sortBy,
    ]);

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
                        <p className="agent-dashboard__error">
                            {error}
                        </p>
                    )}

                    {!loading && tickets.length > 0 && (
                        <>
                            <section className="agent-dashboard__statistics">
                                <article className="agent-dashboard__stat-card">
                                    <span className="agent-dashboard__stat-label">
                                        Total Tickets
                                    </span>

                                    <strong className="agent-dashboard__stat-value">
                                        {ticketStatistics.total}
                                    </strong>
                                </article>

                                <article className="agent-dashboard__stat-card">
                                    <span className="agent-dashboard__stat-label">
                                        Open
                                    </span>

                                    <strong className="agent-dashboard__stat-value">
                                        {ticketStatistics.open}
                                    </strong>
                                </article>

                                <article className="agent-dashboard__stat-card">
                                    <span className="agent-dashboard__stat-label">
                                        In Progress
                                    </span>

                                    <strong className="agent-dashboard__stat-value">
                                        {ticketStatistics.inProgress}
                                    </strong>
                                </article>

                                <article className="agent-dashboard__stat-card">
                                    <span className="agent-dashboard__stat-label">
                                        Closed
                                    </span>

                                    <strong className="agent-dashboard__stat-value">
                                        {ticketStatistics.closed}
                                    </strong>
                                </article>
                            </section>

                            <section className="agent-dashboard__filters">
                                <div className="agent-dashboard__filter-field agent-dashboard__filter-field--search">
                                    <label htmlFor="agent-ticket-search">
                                        Search
                                    </label>

                                    <input
                                        id="agent-ticket-search"
                                        type="search"
                                        placeholder="Search by subject, customer name or email"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                    />
                                </div>

                                <div className="agent-dashboard__filter-field">
                                    <label htmlFor="agent-status-filter">
                                        Status
                                    </label>

                                    <select
                                        id="agent-status-filter"
                                        value={statusFilter}
                                        onChange={(event) =>
                                            setStatusFilter(event.target.value)
                                        }
                                    >
                                        <option value="all">
                                            All Statuses
                                        </option>

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

                                <div className="agent-dashboard__filter-field">
                                    <label htmlFor="agent-priority-filter">
                                        Priority
                                    </label>

                                    <select
                                        id="agent-priority-filter"
                                        value={priorityFilter}
                                        onChange={(event) =>
                                            setPriorityFilter(
                                                event.target.value
                                            )
                                        }
                                    >
                                        <option value="all">
                                            All Priorities
                                        </option>

                                        <option value="high">
                                            High
                                        </option>

                                        <option value="medium">
                                            Medium
                                        </option>

                                        <option value="low">
                                            Low
                                        </option>
                                    </select>
                                </div>

                                <div className="agent-dashboard__filter-field">
                                    <label htmlFor="agent-sort">
                                        Sort By
                                    </label>

                                    <select
                                        id="agent-sort"
                                        value={sortBy}
                                        onChange={(event) =>
                                            setSortBy(event.target.value)
                                        }
                                    >
                                        <option value="newest">
                                            Newest First
                                        </option>

                                        <option value="oldest">
                                            Oldest First
                                        </option>

                                        <option value="subject-az">
                                            Subject A-Z
                                        </option>

                                        <option value="subject-za">
                                            Subject Z-A
                                        </option>

                                        <option value="priority">
                                            Priority
                                        </option>
                                    </select>
                                </div>
                            </section>
                        </>
                    )}

                    {loading ? (
                        <p className="agent-dashboard__loading">
                            Loading tickets...
                        </p>
                    ) : tickets.length === 0 ? (
                        <div className="agent-dashboard__empty">
                            <p>No tickets found.</p>
                        </div>
                    ) : filteredAndSortedTickets.length === 0 ? (
                        <div className="agent-dashboard__empty">
                            <p>
                                No tickets match the selected search
                                and filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="agent-dashboard__result-count">
                                Showing {filteredAndSortedTickets.length}{" "}
                                of {tickets.length} tickets
                            </p>

                            <section className="agent-dashboard__list">
                                {filteredAndSortedTickets.map((ticket) => (
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
                                                Priority:{" "}
                                                {ticket.priority}
                                            </span>

                                            <span className="agent-dashboard__badge">
                                                Status: {ticket.status}
                                            </span>

                                            <span className="agent-dashboard__badge">
                                                Assigned to:{" "}
                                                {ticket.agent_name ||
                                                    "Unassigned"}
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
                        </>
                    )}
                </div>
            </main>
        </>
    );
}

export default AgentDashboard;