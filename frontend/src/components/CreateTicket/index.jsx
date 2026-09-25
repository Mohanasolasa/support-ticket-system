import { useState } from "react";
import { useNavigate } from "react-router-dom";

import client from "../../api/client";
import Navbar from "../Navbar";

import "./index.css";

function CreateTicket() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        priority: "medium",
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

        if (
            !formData.subject.trim() ||
            !formData.description.trim()
        ) {
            setError("Subject and description are required");
            return;
        }

        try {
            setLoading(true);

            await client.post("/tickets", {
                subject: formData.subject.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
            });

            navigate("/customer/tickets");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to create ticket"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="create-ticket">
                <div className="create-ticket__content">
                    <header className="create-ticket__header">
                        <h1>Create Ticket</h1>

                        <p>
                            Submit a support request with the details of your
                            issue.
                        </p>
                    </header>

                    <form
                        className="create-ticket__form"
                        onSubmit={handleSubmit}
                    >
                        <div className="create-ticket__field">
                            <label htmlFor="subject">Subject</label>

                            <input
                                id="subject"
                                name="subject"
                                type="text"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="Enter ticket subject"
                            />
                        </div>

                        <div className="create-ticket__field">
                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your issue"
                            />
                        </div>

                        <div className="create-ticket__field">
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

                        {error && (
                            <p className="create-ticket__error">{error}</p>
                        )}

                        <button
                            className="create-ticket__button"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Creating..." : "Create Ticket"}
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}

export default CreateTicket;