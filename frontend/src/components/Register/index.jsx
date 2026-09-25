import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./index.css";

function Register() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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
        setSuccess("");

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.password.trim()
        ) {
            setError("Name, email, and password are required");
            return;
        }

        try {
            setLoading(true);

            await register(
                formData.name.trim(),
                formData.email.trim(),
                formData.password
            );

            setSuccess("Registration successful. Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 1000);
        } catch (error) {
            setError(
                error.response?.data?.message || "Unable to register"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="register-page">
            <section className="register-card">
                <h1>Create Account</h1>

                <p className="register-card__subtitle">
                    Create your customer account to submit support tickets.
                </p>

                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="register-form__field">
                        <label htmlFor="name">Name</label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="name"
                        />
                    </div>

                    <div className="register-form__field">
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

                    <div className="register-form__field">
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                        />
                    </div>

                    {error && (
                        <p className="register-form__error">{error}</p>
                    )}

                    {success && (
                        <p className="register-form__success">{success}</p>
                    )}

                    <button
                        className="register-form__button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                <p className="register-card__footer">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>
            </section>
        </main>
    );
}

export default Register;