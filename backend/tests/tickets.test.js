const request = require("supertest");

const app = require("../server");
const pool = require("../db");

describe("Tickets API", () => {
    let token;
    let ticketId;

    const testEmail = `ticket-test-${Date.now()}@example.com`;

    beforeAll(async () => {
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Ticket Test Customer",
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
    });

    test("should create a new ticket", async () => {
        const response = await request(app)
            .post("/api/tickets")
            .set("Authorization", `Bearer ${token}`)
            .send({
                subject: "Jest Ticket Test",
                description: "Testing ticket creation using Jest and Supertest.",
                priority: "medium",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("Ticket created successfully");
        expect(response.body.ticketId).toBeDefined();

        ticketId = response.body.ticketId;
    });

    test("should list the customer's tickets", async () => {
        const response = await request(app)
            .get("/api/tickets")
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        const ticket = response.body.find(
            (ticket) => ticket.id === ticketId
        );

        expect(ticket).toBeDefined();
        expect(ticket.subject).toBe("Jest Ticket Test");
    });

    test("should get the ticket by id", async () => {
        const response = await request(app)
            .get(`/api/tickets/${ticketId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(ticketId);
        expect(response.body.subject).toBe("Jest Ticket Test");
    });

    test("should update the ticket", async () => {
        const response = await request(app)
            .put(`/api/tickets/${ticketId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                subject: "Updated Jest Ticket",
                description: "Updated ticket description.",
                priority: "high",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Ticket updated successfully");
    });
    test("should reject an update with no fields", async () => {
        const response = await request(app)
            .put(`/api/tickets/${ticketId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({});

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("At least one field is required");
    });

    test("should delete the ticket", async () => {
        const response = await request(app)
            .delete(`/api/tickets/${ticketId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Ticket deleted successfully");
    });

    test("should return 404 after deleting the ticket", async () => {
        const response = await request(app)
            .get(`/api/tickets/${ticketId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe("Ticket not found");
    });
});

afterAll(async () => {
    await pool.end();
});