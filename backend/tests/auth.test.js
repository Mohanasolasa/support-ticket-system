const request = require("supertest");

const app = require("../server");
const pool = require("../db");

describe("Authentication API", () => {
    const testEmail = `test-${Date.now()}@example.com`;

    test("should register a new customer", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Jest Test Customer",
                email: testEmail,
                password: "Test@123",
                role: "customer",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("User registered successfully");
        expect(response.body.userId).toBeDefined();
    });

    test("should login the registered customer", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: "Test@123",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Login successful");
        expect(response.body.token).toBeDefined();
        expect(response.body.user).toBeDefined();
        expect(response.body.user.role).toBe("customer");
    });

    test("should reject login with an incorrect password", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: "WrongPassword",
            });

        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe("Invalid email or password");
    });
});

afterAll(async () => {
    await pool.end();
});