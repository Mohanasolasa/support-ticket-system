import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./index.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!formData.email.trim() || !formData.password.trim()) {
            setError("Email and password are required");
            return;
        }

        try {
            setLoading(true);

            const response = await login(
                formData.email.trim(),
                formData.password
            );

            if (response.user.role === "agent") {
                navigate("/agent");
            } else {
                navigate("/customer");
            }
        } catch (error) {
            setError(
                error.response?.data?.message || "Unable to login"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">
            <section className="login-card">
                <h1>Support Ticket System</h1>

                <p className="login-card__subtitle">
                    Sign in to manage your support tickets.
                </p>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-form__field">
                        <label htmlFor="email">Email</label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                    </div>

                    <div className="login-form__field">
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <p className="login-form__error">{error}</p>
                    )}

                    <button
                        className="login-form__button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="login-card__footer">
                    Don't have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>
            </section>
        </main>
    );
}

export default Login;