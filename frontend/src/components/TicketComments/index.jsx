import { useEffect, useState } from "react";

import client from "../../api/client";

import "./index.css";

function TicketComments({ ticketId }) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchComments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await client.get(
                `/comments/${ticketId}`
            );

            setComments(response.data.comments || response.data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load comments"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [ticketId]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!comment.trim()) {
            setError("Comment is required");
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            await client.post(`/comments/${ticketId}`, {
                comment: comment.trim(),
            });

            setComment("");

            await fetchComments();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to add comment"
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="ticket-comments">
            <header className="ticket-comments__header">
                <h2>Comments</h2>
            </header>

            {error && (
                <p className="ticket-comments__error">{error}</p>
            )}

            {loading ? (
                <p>Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="ticket-comments__empty">
                    No comments yet.
                </p>
            ) : (
                <div className="ticket-comments__list">
                    {comments.map((item) => (
                        <article
                            className="ticket-comments__item"
                            key={item.id}
                        >
                            <p>{item.comment}</p>

                            <span className="ticket-comments__date">
                                {item.created_at
                                    ? new Date(
                                        item.created_at
                                    ).toLocaleString()
                                    : ""}
                            </span>
                        </article>
                    ))}
                </div>
            )}

            <form
                className="ticket-comments__form"
                onSubmit={handleSubmit}
            >
                <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Write a comment..."
                />

                <button
                    className="ticket-comments__button"
                    type="submit"
                    disabled={submitting}
                >
                    {submitting ? "Adding..." : "Add Comment"}
                </button>
            </form>
        </section>
    );
}

export default TicketComments;