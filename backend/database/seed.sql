USE support_tickets;

INSERT INTO users (name, email, password_hash, role)
VALUES
  (
    'Test Customer',
    'customer@example.com',
    '$2b$10$baAgMO1iD1ZeXSSRGsDL0OiLLcLR4J.Y/dNJtlH.lDH8J0RwRFaZy',
    'customer'
  ),
  (
    'Test Agent',
    'agent@example.com',
    '$2b$10$EZwM9LT/hAeERa8vEXwWfuhctaIsxUz4ENoisz82hm16VqSsaC10u',
    'agent'
  );

INSERT INTO tickets (user_id, subject, description, priority, status)
VALUES
  (
    (SELECT id FROM users WHERE email = 'customer@example.com'),
    'Sample Support Ticket',
    'This is a sample ticket for testing the Support Ticket System.',
    'medium',
    'open'
  );