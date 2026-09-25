import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import Navbar from "../Navbar";

import "./index.css";

function CustomerDashboard() {
    const { user } = useAuth();

    return (
        <>
            <Navbar />

            <main className="customer-dashboard">
                <div className="customer-dashboard__content">
                    <header className="customer-dashboard__header">
                        <h1>Customer Dashboard</h1>

                        <p>
                            Welcome, {user?.name}. Manage your support tickets
                            from here.
                        </p>
                    </header>

                    <section className="customer-dashboard__actions">
                        <article className="customer-dashboard__card">
                            <h2>My Tickets</h2>

                            <p>
                                View the tickets you have created and check their
                                current status.
                            </p>

                            <Link
                                className="customer-dashboard__button"
                                to="/customer/tickets"
                            >
                                View Tickets
                            </Link>
                        </article>

                        <article className="customer-dashboard__card">
                            <h2>Create a Ticket</h2>

                            <p>
                                Submit a new support request to the support team.
                            </p>

                            <Link
                                className="customer-dashboard__button"
                                to="/customer/tickets/create"
                            >
                                Create Ticket
                            </Link>
                        </article>
                    </section>
                </div>
            </main>
        </>
    );
}

export default CustomerDashboard;