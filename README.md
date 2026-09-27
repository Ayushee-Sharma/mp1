# Reaching the Unreached

A MERN fullstack application scaffolded with:
- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (via Mongoose)

---

## Project Structure

```text
reaching-the-unreached/
├── client/                     # Frontend application (React + Vite + Tailwind CSS)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── assets/             # Images, SVGs, icons
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Generic elements (buttons, inputs, cards)
│   │   │   └── layout/         # Layout components (navbar, footer, sidebar)
│   │   ├── context/            # React Context API providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Page/view level components
│   │   ├── services/           # API interaction and HTTP client setup
│   │   ├── utils/              # Client-side utility functions and constants
│   │   ├── App.jsx             # Main application component
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # React root mount entry point
│   ├── .env.example            # Client environment variable template
│   ├── index.html              # HTML shell
│   ├── package.json            # Client dependencies and scripts
│   ├── postcss.config.js       # PostCSS configuration for Tailwind
│   ├── tailwind.config.js      # Tailwind CSS configuration
│   └── vite.config.js          # Vite build and dev server config
│
├── server/                     # Backend application (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/             # Database and app configuration (MongoDB Atlas)
│   │   ├── controllers/        # Request handling and controller layer
│   │   ├── middleware/         # Express middleware (auth, error handlers, etc.)
│   │   ├── models/             # Mongoose data schemas and models
│   │   ├── routes/             # Express API route declarations
│   │   ├── services/           # Business logic layer
│   │   ├── utils/              # Server-side helper utilities
│   │   ├── app.js              # Express app setup and middleware configuration
│   │   └── server.js           # Server entry point and database connection initialization
│   ├── .env.example            # Server environment variable template (MongoDB URI, etc.)
│   └── package.json            # Server dependencies and scripts
│
├── .gitignore                  # Root Git ignore rules
├── package.json                # Root package configuration for fullstack orchestration
└── README.md                   # Project documentation
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ recommended)
- A **MongoDB Atlas** cluster account and connection string

### 2. Environment Configuration

#### Backend (`server/.env`):
Copy `server/.env.example` to `server/.env` and update the variables:
```bash
cp server/.env.example server/.env
```
Fill in your MongoDB Atlas connection URI:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/<database-name>?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/.env`):
Copy `client/.env.example` to `client/.env`:
```bash
cp client/.env.example client/.env
```
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Installation

Install all dependencies across root, server, and client:
```bash
npm run install:all
```

Alternatively, install individually:
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 4. Running the Application

To run both client and server concurrently from the root directory:
```bash
npm run dev
```

Or run them in separate terminal tabs:
- **Backend API**: `cd server && npm run dev` (Runs on `http://localhost:5000`)
- **Frontend App**: `cd client && npm run dev` (Runs on `http://localhost:5173`)
