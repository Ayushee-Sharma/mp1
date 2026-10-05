# Reaching the Unreached

A MERN stack healthcare access platform designed for rural communities and underserved populations. The app helps patients find doctors, view hospital information, book appointments, manage prescriptions, and access role-based healthcare dashboards.

## Project Overview

Reaching the Unreached focuses on reducing barriers to healthcare in rural and semi-rural areas by creating a simple digital platform for:
- patient registration and login
- doctor and hospital discovery
- appointment booking and slot management
- doctor-led prescription generation
- admin oversight for system metrics and user management

## Target Users
- Patients
- Doctors
- Hospitals / healthcare facilities
- Admins / system managers

## Core Features
- Role-based authentication (patient, doctor, admin)
- Doctor listing and search by specialization and location
- Doctor profiles and availability information
- Appointment booking with duplicate-slot prevention
- Appointment lifecycle management (Pending, Confirmed, Cancelled, Completed, Rejected)
- Doctor-created e-prescriptions linked to appointments
- Patient viewing of prescriptions
- Admin dashboards for doctors, patients, appointments, and hospitals

## Tech Stack
- MongoDB
- Express.js
- React
- Node.js
- Vite
- Mongoose
- JWT authentication
- Tailwind CSS
- Axios
- bcryptjs

## Application Architecture

Frontend (React + Vite) handles the user interface and role-based dashboards.
Backend (Node.js + Express) handles API requests, authentication, business rules, and database operations.
MongoDB stores the application data.

## Important Notes
- The project is designed for rural healthcare access, not for a large corporate hospital chain.
- SMS alerts, online payments, video consultations, and chat features are not part of the final implemented scope.
- The working development setup uses a Vite proxy so frontend requests to `/api` are routed to the backend inside the same Codespace environment.

## Project Structure

```text
.
├── backend/
│   ├── src/
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env
│   └── package.json
├── README.md
├── ppt_instructions.txt
├── report_instructions.txt
├── package.json
└── prompt.txt
```

## Running the Project

1. Install dependencies in the root and frontend/backend packages as needed.
2. Configure MongoDB connection in the backend `.env` file.
3. Start the backend server.
4. Start the frontend dev server.
5. Open the app in the browser and test login, appointment, and prescription flows.

## Notes for Developers

The project was implemented and validated against the requirement source in `prompt.txt`. The working flow includes registration, authentication, doctor discovery, appointment booking, duplicate prevention, prescription creation, and admin metrics.

