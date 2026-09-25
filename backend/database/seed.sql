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
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  role = VALUES(role);

INSERT INTO tickets (user_id, subject, description, priority, status)
SELECT
  u.id,
  'Sample Support Ticket',
  'This is a sample ticket for testing the Support Ticket System.',
  'medium',
  'open'
FROM users u
WHERE u.email = 'customer@example.com'
  AND NOT EXISTS (
    SELECT 1
    FROM tickets t
    WHERE t.user_id = u.id
      AND t.subject = 'Sample Support Ticket'
  );