import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./index.css";

function Navbar() {
    const { user, logout } = useAuth();

    const dashboardPath =
        user?.role === "agent" ? "/agent" : "/customer";

    return (
        <nav className="navbar">
            <div className="navbar__inner">
                <Link className="navbar__brand" to={dashboardPath}>
                    Support Ticket System
                </Link>

                <div className="navbar__links">
                    {user?.role === "customer" && (
                        <>
                            <Link to="/customer">Dashboard</Link>
                            <Link to="/customer/tickets">My Tickets</Link>
                            <Link to="/customer/tickets/create">
                                Create Ticket
                            </Link>
                        </>
                    )}

                    {user?.role === "agent" && (
                        <Link to="/agent">Dashboard</Link>
                    )}
                </div>

                <div className="navbar__user">
                    <span className="navbar__user-name">
                        {user?.name}
                    </span>

                    <button
                        className="navbar__logout"
                        type="button"
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;