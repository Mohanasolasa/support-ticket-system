const request = require("supertest");

const app = require("../server");
const pool = require("../db");

describe("Comments API", () => {
    let token;
    let ticketId;
    let commentId;

    const testEmail = `comment-test-${Date.now()}@example.com`;

    beforeAll(async () => {
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Comment Test Customer",
                email: testEmail,
                password: "Test@123",
                role: "customer",
            });

        expect(registerResponse.statusCode).toBe(201);

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: "Test@123",
            });

        expect(loginResponse.statusCode).toBe(200);

        token = loginResponse.body.token;

        const ticketResponse = await request(app)
            .post("/api/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                subject: "Comment Test Ticket",
                description: "Testing ticket comments.",
                priority: "medium",
            });

        expect(ticketResponse.statusCode).toBe(201);

        ticketId = ticketResponse.body.ticketId;
    });

    test("should add a comment to the customer's ticket", async () => {
        const response = await request(app)
            .post(`/api/comments/${ticketId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                comment: "This is a test comment.",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Comment added successfully");
        expect(response.body.commentId).toBeDefined();

        commentId = response.body.commentId;
    });

    test("should list comments for the customer's ticket", async () => {
        const response = await request(app)
            .get(`/api/comments/${ticketId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        const comment = response.body.find(
            (item) => item.id === commentId
        );

        expect(comment).toBeDefined();
        expect(comment.comment).toBe("This is a test comment.");
    });

    test("should reject an empty comment", async () => {
        const response = await request(app)
            .post(`/api/comments/${ticketId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                comment: "",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Comment is required");
    });

    test("should reject access to another user's ticket comments", async () => {
        const otherEmail = `other-comment-test-${Date.now()}@example.com`;

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Other Customer",
                email: otherEmail,
                password: "Test@123",
                role: "customer",
            });

        expect(registerResponse.statusCode).toBe(201);

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
                email: otherEmail,
                password: "Test@123",
            });

        expect(loginResponse.statusCode).toBe(200);

        const otherToken = loginResponse.body.token;

        const response = await request(app)
            .get(`/api/comments/${ticketId}`)
            .set("Authorization", `Bearer ${otherToken}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Ticket not found");
    });
});

afterAll(async () => {
    await pool.end();
});