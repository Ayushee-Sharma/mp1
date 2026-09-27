# Reaching the Unreached

A MERN full-stack healthcare booking application connecting rural communities with doctors, hospitals, and patient support services.

## Project Structure

```text
/workspaces/mp1
├── backend/
│   ├── src/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── ...
├── README.md
├── package.json
├── prompt.txt
└── .gitignore
```

## Environment setup

Create the environment files for the current project structure:

### Backend
Create [backend/.env](backend/.env) and paste your MongoDB Atlas connection string into `MONGO_URI`.

```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=
JWT_SECRET=change_this_to_a_long_random_secret
```

Use the example file as a template:

```bash
cp backend/.env.example backend/.env
```

> Paste your MongoDB Atlas connection string into `backend/.env` under `MONGO_URI`.

### Frontend
Create [frontend/.env](frontend/.env):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
cp frontend/.env.example frontend/.env
```

## Demo accounts

The seed script creates the following local/demo accounts for testing:

- Admin: `admin@example.com` / `password123`
- Doctor: `doctor@example.com` / `password123`
- Patient: `patient@example.com` / `password123`

These accounts are for local development and demonstration only.

## Run the app

Install dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Run both apps together:

```bash
npm run dev
```

Or run separately:

```bash
npm run backend
npm run frontend
```

## Seed demo data

```bash
npm run seed
```

This adds realistic sample doctors, patients, hospitals, and appointments while reusing existing records safely and avoiding duplicate creation on repeated runs.

## Features included

- Patient, doctor, and admin auth
- Role-based access control
- Doctor listing and specialization filters
- Doctor profile and appointment booking
- Appointment status tracking and cancellation
- Hospital and bed availability display
- Admin dashboard and doctor activation controls
- Responsive UI with loading and error states
