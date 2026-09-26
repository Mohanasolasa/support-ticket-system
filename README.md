# Support Ticket Management System

A full-stack Support Ticket Management System with role-based access for customers and agents.

## Live Application

- Frontend: https://support-ticket-system-red.vercel.app
- Backend API: https://support-ticket-system-44fo.onrender.com/

## GitHub

https://github.com/Mohanasolasa/support-ticket-system

## Features

### Authentication and Authorization

- Customer registration
- Customer and agent login
- Password hashing with bcrypt
- JWT-based authentication
- Protected frontend routes
- Protected backend APIs
- Role-based authorization
- Customer and agent access restrictions
- Logout

### Customer Features

- Customer dashboard
- Create support tickets
- View own tickets
- Search tickets by subject or description
- Filter tickets by status
- Filter tickets by priority
- View ticket details
- View ticket creation and update date/time
- Add comments to tickets
- View ticket comments
- Customer ticket isolation

### Agent Features

- Agent dashboard
- Dashboard statistics
- View all tickets
- Search tickets by subject, customer name, or customer email
- Filter tickets by status
- Filter tickets by priority
- Sort tickets
- View ticket details
- View ticket creation and update date/time
- Update ticket status
- Update ticket priority
- Assign tickets
- Add agent comments
- View ticket comments
- Agent-only access controls

## Technology Stack

### Frontend

- React
- React Router
- Axios
- Vite
- CSS

### Backend

- Node.js
- Express
- MySQL
- mysql2
- JWT
- bcrypt
- CORS
- dotenv

### Testing

- Jest
- Supertest
- Postman
- Newman

### Deployment

- Vercel - Frontend
- Render - Backend
- Aiven MySQL - Database

## Project Structure

```text
support-ticket-system/
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── middleware/
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── db.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
├── .gitignore
└── README.md