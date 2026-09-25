const request = require("supertest");

const app = require("../server");
const pool = require("../db");

describe("Agent API", () => {
    let customerToken;
    let agentToken;
    let ticketId;

    const customerEmail = `agent-test-customer-${Date.now()}@example.com`;
    const agentEmail = `agent-test-agent-${Date.now()}@example.com`;

    beforeAll(async () => {
        const customerRegister = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Agent Test Customer",
                email: customerEmail,
                password: "Test@123",
                role: "customer",
            });

        expect(customerRegister.statusCode).toBe(201);

        const customerLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: customerEmail,
                password: "Test@123",
            });

        expect(customerLogin.statusCode).toBe(200);

        customerToken = customerLogin.body.token;

        const agentRegister = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Agent Test User",
                email: agentEmail,
                password: "Agent@123",
                role: "agent",
            });

        expect(agentRegister.statusCode).toBe(201);

        const agentLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: agentEmail,
                password: "Agent@123",
            });

        expect(agentLogin.statusCode).toBe(200);

        agentToken = agentLogin.body.token;

        const ticketResponse = await request(app)
            .post("/api/tickets")
            .set("Authorization", `Bearer ${customerToken}`)
            .send({
                subject: "Agent API Test Ticket",
                description: "Testing agent ticket management.",
                priority: "medium",
            });

        expect(ticketResponse.statusCode).toBe(201);

        ticketId = ticketResponse.body.ticketId;
    });

    test("should allow an agent to list all tickets", async () => {
        const response = await request(app)
            .get("/api/agent/tickets")
            .set("Authorization", `Bearer ${agentToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        const ticket = response.body.find(
            (item) => item.id === ticketId
        );

        expect(ticket).toBeDefined();
    });

    test("should allow an agent to assign a ticket to themselves", async () => {
        const response = await request(app)
            .put(`/api/agent/tickets/${ticketId}/assign`)
            .set("Authorization", `Bearer ${agentToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Ticket assigned successfully");
    });

    test("should allow an agent to update ticket status", async () => {
        const response = await request(app)
            .put(`/api/agent/tickets/${ticketId}/status`)
            .set("Authorization", `Bearer ${agentToken}`)
            .send({
                status: "in_progress",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Ticket status updated successfully");
    });

    test("should reject an invalid ticket status", async () => {
        const response = await request(app)
            .put(`/api/agent/tickets/${ticketId}/status`)
            .set("Authorization", `Bearer ${agentToken}`)
            .send({
                status: "invalid_status",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid status");
    });

    test("should allow an agent to update ticket priority", async () => {
        const response = await request(app)
            .put(`/api/agent/tickets/${ticketId}/priority`)
            .set("Authorization", `Bearer ${agentToken}`)
            .send({
                priority: "high",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Ticket priority updated successfully");
    });

    test("should reject an invalid ticket priority", async () => {
        const response = await request(app)
            .put(`/api/agent/tickets/${ticketId}/priority`)
            .set("Authorization", `Bearer ${agentToken}`)
            .send({
                priority: "invalid_priority",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid priority");
    });

    test("should allow an agent to add a comment", async () => {
        const response = await request(app)
            .post(`/api/agent/tickets/${ticketId}/comments`)
            .set("Authorization", `Bearer ${agentToken}`)
            .send({
                comment: "Agent reviewed this ticket.",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Agent comment added successfully");
        expect(response.body.commentId).toBeDefined();
    });

    test("should allow an agent to get ticket details", async () => {
        const response = await request(app)
            .get(`/api/agent/tickets/${ticketId}`)
            .set("Authorization", `Bearer ${agentToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(ticketId);
        expect(response.body.status).toBe("in_progress");
        expect(response.body.priority).toBe("high");
    });

    test("should allow an agent to list ticket comments", async () => {
        const response = await request(app)
            .get(`/api/agent/tickets/${ticketId}/comments`)
            .set("Authorization", `Bearer ${agentToken}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        expect(
            response.body.some(
                (comment) => comment.comment === "Agent reviewed this ticket."
            )
        ).toBe(true);
    });

    test("should reject customer access to agent ticket listing", async () => {
        const response = await request(app)
            .get("/api/agent/tickets")
            .set("Authorization", `Bearer ${customerToken}`);

        expect(response.statusCode).toBe(403);
        expect(response.body.message).toBe("Access denied");
    });
});

afterAll(async () => {
    await pool.end();
});