# Reaching the Unreached

## 1. Project Overview

### Project title
Reaching the Unreached

### Problem being addressed
The project is built to improve access to healthcare for rural communities and underserved populations. In simple terms, it tries to close the gap between patients who need medical attention and the healthcare providers available to serve them. The application is designed around a rural healthcare context near Nabha, Punjab, India, where patients may struggle to find doctors, schedule appointments, and access hospitals or follow-up care.

### Why rural healthcare access can be difficult
In many rural and semi-rural areas, healthcare access is difficult because of:
- limited transportation
- fewer doctors and hospitals nearby
- long waiting times
- poor digital access or information flow
- difficulty organising appointments in advance
- weak coordination between patients, doctors, and healthcare facilities

The project aims to reduce these barriers by bringing essential healthcare information and appointment management into a single digital system.

### Main idea of “Reaching the Unreached”
The idea is to create a simple, practical healthcare platform that helps patients connect with doctors, see hospitals and facilities, manage appointments, and receive digital prescriptions when appropriate. It is intended as a healthcare access and management platform rather than a hospital management system of a large corporate chain.

### Target users
The application is built for:
- Patients seeking treatment or consultation
- Doctors who need to manage appointments and provide care
- Hospitals or healthcare facilities that need visibility of local services
- Administrators who need oversight of system activity

### Main objectives
The main goals implemented in this project are:
- allow users to register and log in
- distinguish between patient, doctor, and admin roles
- show doctors and hospital information
- allow appointment booking
- prevent duplicate appointment booking on the same doctor/date/time slot
- allow doctors to manage appointments and create prescriptions
- allow patients to view their prescriptions
- allow admin oversight of doctors, patients, and departmental metrics
- keep the system connected through a working frontend, backend, and MongoDB Atlas database

### Major features actually implemented
Implemented features confirmed by the existing codebase:
- User registration for patient and doctor roles
- Login flow using JWT-based authentication
- Role-based access control for patient, doctor, and admin users
- Doctor listing and search/filtering by specialization and location
- Doctor profile viewing and availability details
- Appointment booking for patients
- Duplicate slot protection using a database check on doctor/date/time/status
- Appointment status updates (Pending, Confirmed, Cancelled, Completed, Rejected)
- Hospital listing and bed information cards
- Admin dashboard statistics for doctors, patients, appointments, and hospitals
- Admin control to toggle doctor active/inactive status
- E-prescription creation by doctors for their own confirmed/completed appointments
- Prescription viewing by patient and doctor for authorized records
- React dashboard screens for patient, doctor, and admin roles
- Vite development proxy to route `/api` requests to the backend inside the Codespace

### Features considered but not part of the final implementation
The following are not part of the final implemented scope based on the actual repository and requirements file:
- SMS alerts / SMS notification feature
- Real payment gateway integration
- Video consultation or telemedicine module
- Real-time chat or messaging
- Multi-language interface
- External AI-based triage or diagnosis system

Important note: SMS was discussed during development but is not present in the actual requirement source file `prompt.txt` and is not implemented in the current codebase. It should not be documented as a completed feature.

### Technology stack
The project uses a classic MERN stack architecture:
- MongoDB: database
- Express.js: backend API server
- React: frontend interface
- Node.js: JavaScript runtime for the backend

Additional technologies used in the project:
- Vite: frontend development/build tooling
- Mongoose: MongoDB object modeling and validation
- JWT: authentication token generation and validation
- bcryptjs: password hashing
- CORS: browser origin management
- Tailwind CSS: styling for the frontend
- Axios: frontend HTTP client
- dotenv: environment configuration

### Overall system architecture
The application follows a standard full-stack architecture:

- React frontend handles the user interface and dashboards
- Vite dev server handles local frontend development and API proxying
- Express backend exposes REST APIs
- Mongoose models interact with MongoDB Atlas
- JWT authentication passes user identity between frontend and backend
- MongoDB stores users, doctors, patients, hospitals, appointments, and prescriptions

The system is designed to separate concerns clearly:
- frontend handles interface and user interactions
- backend handles rules, validation, and data access
- database stores the application data

---

## 2. Requirements and Development Journey

This project was built from an existing workspace and then verified against the implementation and requirements in `prompt.txt`. The development happened in stages rather than as a single instant creation.

### Development Journey (timeline)

#### 1. Initial project requirement and stack setup
The project began with a requirement to build a full-stack MERN application for rural healthcare access. The requirement file specified:
- React
- Vite
- JavaScript
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Tailwind CSS
- REST APIs

The structure was set up with separate frontend and backend folders and the necessary package files.

#### 2. Initial project structure and audit
The repository was examined to check what already existed, including:
- frontend pages, services, and context files
- backend routes, controllers, models, and middleware
- seed data
- environment setup files

The project was then audited for missing or incomplete pieces before any final verification.

#### 3. Frontend-backend integration check
The frontend and backend were reviewed to determine whether they were correctly talking to each other. Important checks included:
- API base URL configuration
- route mounting structure
- whether the frontend used the correct backend endpoints
- whether auth headers were being attached properly

This became critical when browser testing showed a runtime network problem.

#### 4. Identification of missing or incomplete features
During the implementation phase, the project was checked against the requirement source for missing features and incomplete business logic. Missing or incomplete areas were then completed, including:
- prescription implementation
- appointment lifecycle logic
- role-based access checks
- admin-facing statistics
- doctor availability behaviour

#### 5. MongoDB Atlas connection
The backend was configured to connect to MongoDB Atlas using Mongoose. The actual database connection logic lives in:
- `backend/src/config/db.js`

The application uses a `MONGO_URI` value from the backend environment file and logs a clear success message when connected.

#### 6. Backend and API testing
The backend APIs were tested directly using the running server. This included:
- health endpoint
- auth login
- doctor listing
- hospital listing
- appointment booking
- duplicate-slot rejection
- prescription creation
- patient/doctor prescription retrieval
- admin restrictions

The project was validated with real HTTP calls rather than only static code review.

#### 7. Appointment booking verification
The appointment creation flow was tested and validated. The key logic includes a duplicate slot protection check in `appointmentController.js`:
- if a doctor already has an active appointment at the same date/time, the request returns `409 Conflict`
- this prevents double-booking

The successful booking path returns `201 Created`.

#### 8. E-prescription implementation
Once the core appointment flow was working, the prescription logic was implemented and connected to both the backend and the frontend. This included:
- `Prescription.js` model
- `prescriptionController.js`
- `prescriptionRoutes.js`
- frontend dashboard support for doctor-created prescriptions
- patient-side prescription viewing

#### 9. Role-based prescription access
Prescription access was restricted to actual allowed roles:
- doctors can create prescriptions only for their own appointments
- patients can view their own prescriptions
- doctors can view their own prescriptions
- admin access is restricted where forbidden by the code

This was checked in the backend controller logic.

#### 10. Browser and Codespaces testing
The app was tested through the browser environment and a local Codespaces setup. The browser initially showed a generic “Network Error” during runtime. This was eventually diagnosed as a browser-origin problem caused by how localhost and forwarded ports behave in Codespaces.

#### 11. Localhost vs Codespaces forwarded-port problem
This was a crucial step.

The frontend had originally used `http://localhost:5000/api` for the API base URL. This works when the frontend is running and being used inside the same machine/container environment. But in a browser opened from the user’s normal machine, `localhost:5000` refers to the user’s own device, not the remote Codespace container.

This is why browser requests were failing even though the backend was running normally.

#### 12. Public forwarded backend URL issue
The project also tested the public forwarded backend URL from Codespaces, such as the `*.app.github.dev` URL. That approach solved the “wrong machine” problem but introduced another issue: the forwarded backend URL is protected by the Codespaces authentication tunnel and returned an HTTP 302 redirect to the GitHub Codespaces sign-in flow.

That meant the browser was being redirected to authenticate before the app data loaded.

#### 13. Final Vite `/api` proxy solution
The final working development architecture is:
- browser requests `/api`
- Vite frontend dev server proxies `/api` to `http://localhost:5000`
- the backend runs locally inside the Codespace and serves requests there
- the browser does not directly call the public forwarded backend URL

This keeps the app working in a development environment without disabling Codespaces protection or creating a public backend port.

#### 14. Final Git/GitHub backup and commit process
The project was managed in Git and later pushed to GitHub. The repository was checked for working state, and all relevant project changes were committed after the program was verified. This included ensuring that prescription-related workflow changes were added and tracked properly before the final state was saved.

---

## 3. MERN Stack Explained from Zero

### M = MongoDB
MongoDB is a database system used to store application data. It stores information in collections and documents instead of in tables like traditional SQL databases.

In this project, MongoDB holds:
- users
- doctors
- patients
- hospitals
- appointments
- prescriptions

#### Why it is needed
Without a database, the app would not remember records between page refreshes or users. The project needs persistent data so appointments, doctor profiles, and prescriptions remain available.

#### Actual files in this project
- `backend/src/models/User.js`
- `backend/src/models/Doctor.js`
- `backend/src/models/Patient.js`
- `backend/src/models/Hospital.js`
- `backend/src/models/Appointment.js`
- `backend/src/models/Prescription.js`
- `backend/src/config/db.js`

### E = Express.js
Express.js is a Node.js framework used to build API servers. It helps create routes for requests like login, doctor listing, and appointment booking.

#### Why it is needed
Without Express, the backend would be much harder to structure. It handles incoming HTTP requests and sends responses back to the frontend.

#### What it does in this project
- creates routes under `/api`
- validates requests
- calls controller functions
- handles role-based authorization
- sends JSON responses

#### Actual files in this project
- `backend/src/app.js`
- `backend/src/routes/*.js`
- `backend/src/controllers/*.js`
- `backend/src/middleware/authMiddleware.js`

### R = React
React is a JavaScript library used for building the user interface. It helps create pages, components, and interactive logic.

#### Why it is needed
The frontend needs to show pages like login, doctor lists, dashboards, and forms, and React makes that easier with reusable components.

#### Actual project examples
- login screen
- patient dashboard
- doctor dashboard
- admin dashboard
- appointments page
- hospitals page
- doctor profile page

#### Actual files in this project
- `frontend/src/App.jsx`
- `frontend/src/pages/*.jsx`
- `frontend/src/components/**/*.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/services/*.js`

### N = Node.js
Node.js is the JavaScript runtime used to run the backend outside the browser.

#### Why it is needed
The backend is a server, and Node.js lets JavaScript run there. It is used to run Express and connect to the database.

#### Actual project file
- `backend/src/server.js`

### How these technologies work together
Think of the system like a restaurant:
- React is the front desk and menu
- Vite is the local kitchen helper during development
- Express is the waiter that receives requests
- Node.js runs the kitchen engine
- MongoDB stores all records
- Mongoose helps organize the data in a structured way

In this project:
- the patient opens the React UI
- React sends a request to `/api/...`
- Vite proxies the request to the backend during development
- Express routes the request to the correct controller
- the controller reads or writes to MongoDB
- the backend returns JSON
- React updates the UI

---

## 4. Complete System Architecture

### ASCII architecture diagram
```text
USER
  ↓
REACT FRONTEND
  ↓
VITE DEVELOPMENT SERVER
  ↓
/API REQUEST
  ↓
NODE + EXPRESS BACKEND
  ↓
ROUTES
  ↓
CONTROLLERS
  ↓
MIDDLEWARE + AUTH
  ↓
MONGOOSE MODELS
  ↓
MONGODB ATLAS
  ↓
JSON RESPONSE
  ↓
REACT UI UPDATE
```

### What an HTTP request is
HTTP is the way computers communicate over the web. A request usually includes:
- method (GET, POST, PUT, PATCH, DELETE)
- URL
- headers
- body (for JSON data)

### HTTP methods used in this project
- GET: read data
- POST: create data
- PUT: update data
- DELETE: delete or cancel data

In the codebase, the main app uses:
- GET for listing and retrieving doctors, hospitals, appointments, and prescriptions
- POST for login, registration, appointment creation, and prescription creation
- PUT for profile updates and status updates
- DELETE for appointment cancellation

### JSON
JSON is a text format for sending structured data between frontend and backend. It looks like:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "...",
  "user": {
    "role": "patient"
  }
}
```

### HTTP status codes used in this project
Important real status codes used by the app:
- `200 OK` — successful GET or update
- `201 Created` — successful creation such as appointment or prescription
- `400 Bad Request` — invalid or incomplete data
- `401 Unauthorized` — missing or invalid token
- `403 Forbidden` — user role is not allowed
- `404 Not Found` — resource missing
- `409 Conflict` — duplicate or unavailable slot
- `500 Internal Server Error` — server-side failure

### Request/response cycle example: patient books appointment
1. Patient selects doctor and time in the React UI
2. Frontend sends a POST request to `/api/appointments`
3. Vite dev server proxies `/api` to `http://localhost:5000`
4. Express receives the request
5. Route identifies the correct controller
6. Controller validates the request and checks the time slot
7. Model checks for an existing appointment with same doctor/date/time
8. If no conflict, a new appointment record is created in MongoDB
9. Backend returns JSON success response
10. React updates the UI and shows confirmation

### Example: login flow
1. User enters email and password
2. React calls `authService.login()`
3. Axios sends POST to `/auth/login`
4. Express backend route receives the request
5. Controller checks the database for the email and validates password
6. Backend creates JWT token
7. Frontend stores token in localStorage
8. React loads the appropriate dashboard based on role

### Example: doctor listing
1. Frontend requests `/api/doctors`
2. Express route calls `getDoctors()`
3. Controller queries doctors with filtering logic
4. MongoDB returns active doctor records
5. React displays them in the doctor search page

### Example: appointment duplicate prevention
1. Patient tries to book a slot already reserved for that doctor/date/time
2. Controller queries `Appointment` collection for matching doctor/date/time/status in Pending or Confirmed
3. If match exists, returns `409` with message: “This appointment slot is no longer available. Please choose another time.”
4. Frontend displays the booking error

### Example: prescription creation
1. Doctor opens an appointment and clicks prescription form
2. Doctor fills diagnosis and medicines
3. Frontend sends POST to `/api/prescriptions`
4. Controller verifies appointment belongs to the doctor
5. Controller validates allowed appointment status
6. Prescription stored in MongoDB with appointment relationship
7. React displays success message

### Example: patient viewing prescription
1. Patient requests `/api/prescriptions`
2. Express checks patient role and filters by patient ID
3. Backend returns prescriptions with related doctor and appointment data
4. React displays the records in the patient dashboard

### Example: Admin dashboard statistics
1. Admin requests `/api/admin/stats`
2. Express route routes to admin controller
3. Controller fetches counts for users, doctors, hospitals, and appointment statuses
4. Results are returned as JSON
5. Frontend shows dashboard numbers and recent activity

---

## 5. Frontend Architecture

The frontend application lives in the `frontend/` folder and is built with React and Vite.

### Main frontend folder structure
```text
frontend/
├── public/
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── routing/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── AppointmentsPage.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── DoctorProfilePage.jsx
│   │   ├── FindDoctorsPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── HospitalsPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── RegisterPage.jsx
│   ├── services/
│   │   ├── adminService.js
│   │   ├── api.js
│   │   ├── appointmentService.js
│   │   ├── authService.js
│   │   ├── doctorService.js
│   │   └── hospitalService.js
│   └── utils/
├── .env
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── index.html
```

### React
The app uses React to render reusable UI blocks and multiple pages. Components are structured around sections such as:
- common UI widgets
- layout pieces such as Navbar and Footer
- routed pages for the app experience

### Pages
Important pages include:
- `HomePage.jsx` — landing page
- `LoginPage.jsx` — user login
- `RegisterPage.jsx` — registration page
- `FindDoctorsPage.jsx` — search doctors and browse results
- `DoctorProfilePage.jsx` — view doctor details and slots
- `PatientDashboard.jsx` — patient portal
- `DoctorDashboard.jsx` — doctor appointment management and prescribing
- `AdminDashboard.jsx` — admin overview
- `AppointmentsPage.jsx` — common appointment view
- `HospitalsPage.jsx` — hospital and bed information

### Services
The `frontend/src/services/` folder is the API layer for the frontend.

Important files:
- `api.js` — Axios base instance that attaches the Authorization header and centralizes API configuration
- `authService.js` — login/register/getMe endpoints
- `doctorService.js` — search, profile, slot, and availability APIs
- `appointmentService.js` — appointment and prescription endpoints
- `hospitalService.js` — hospital listing endpoints
- `adminService.js` — admin dashboard statistics and role management

### Routing
The application uses React Router in `App.jsx`.

Routes include:
- public pages like home, doctors, hospitals, login, register
- protected patient routes
- protected doctor routes
- protected admin routes
- shared protected appointments route

### Authentication state
Authentication state is managed by `AuthContext.jsx`.

This context:
- reads a stored JWT token from `localStorage`
- stores the login user in state
- loads the current user profile from `/auth/me`
- provides login, register, logout, and update user actions
- affects role-based UI access through protected routes

### Role-based UI
Protected routes are controlled by `ProtectedRoute.jsx` and the role passed to them. The app checks whether a logged-in user is allowed to view a page.

Actual allowed roles in this project:
- patient
- doctor
- admin

### Important file-to-purpose mapping
| File | Purpose | Connection to project |
|---|---|---|
| `frontend/src/services/api.js` | Shared API setup | Handles all Axios requests and auth token injection |
| `frontend/src/services/appointmentService.js` | Appointment + prescription API calls | Connects UI to backend appointment and prescription endpoints |
| `frontend/src/pages/DoctorDashboard.jsx` | Doctor work area | Used for managing appointments and generating e-prescriptions |
| `frontend/src/pages/PatientDashboard.jsx` | Patient portal | Displays appointments, prescriptions, and community health info |
| `frontend/src/context/AuthContext.jsx` | Auth state | Manages login, token persistence, and current user data |
| `frontend/src/components/routing/ProtectedRoute.jsx` | Access control | Restricts pages to allowed user roles |

---

## 6. Backend Architecture

The backend code lives in `backend/src/` and is built with Node.js and Express.

### Main backend structure
```text
backend/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── appointmentController.js
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── hospitalController.js
│   │   └── prescriptionController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Doctor.js
│   │   ├── Hospital.js
│   │   ├── Patient.js
│   │   ├── Prescription.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── hospitalRoutes.js
│   │   ├── index.js
│   │   └── prescriptionRoutes.js
│   ├── seed/
│   │   ├── seed.js
│   │   └── seedData.js
│   └── utils/
│       └── generateToken.js
├── .env
├── .env.example
├── package.json
└── ...
```

### Server entry point
The backend starts in `backend/src/server.js`.

This file:
- loads environment variables through dotenv
- imports the Express app
- calls `connectDB()` from config/db.js
- starts the server on port 5000 by default
- exposes the health endpoint at `/api/health`

### App configuration
`backend/src/app.js` configures:
- Express app instance
- CORS configuration
- JSON parsing
- route mounting under `/api`
- error middleware

### Route layer
Routes are defined in `backend/src/routes/` and include:
- `/api/auth` for auth operations
- `/api/doctors` for doctor operations
- `/api/appointments` for appointment lifecycle management
- `/api/prescriptions` for prescriptions
- `/api/hospitals` for hospitals
- `/api/admin` for admin-only operations

### Controller layer
Controllers handle business logic such as:
- registration and login
- doctor search and availability
- appointment creation and duplicate prevention
- prescription creation and access checks
- admin statistics and status toggles

### Model layer
The project uses Mongoose models to define database shape and validation rules. Each model is connected to a collection.

### Middleware
The backend middleware handles:
- JWT authentication (`protect`)
- role authorization (`authorize`)
- general 404 and error handling

### Authentication and authorization flow
The flow is:
`request → route → middleware → controller → model → MongoDB → response`

The `protect` middleware verifies the JWT from the `Authorization` header.
The `authorize` middleware restricts access by role.

---

## 7. Database: Explain from Zero

### What is a database?
A database is a place where an application stores information so it can be used later. It keeps data safe, consistent, and searchable.

### Why the project needs one
This project needs data such as:
- users and accounts
- doctor profiles
- appointment records
- patient details
- hospital information
- prescription records

If these were only stored in the browser, they would disappear and not be shared across users.

### Why data should not be stored in React alone
React state is temporary and lives in the browser. It is useful for UI but not suitable as permanent storage for application data. The backend and database are necessary for real application data.

### What MongoDB is
MongoDB is a NoSQL database that stores data as documents in collections. It is flexible and works well for applications with evolving structures.

### What MongoDB Atlas is
MongoDB Atlas is a cloud-hosted MongoDB service. In this project, the backend connects to Atlas using a connection string stored in `backend/.env`.

### Database terminology
- Database: the overall data container
- Collection: a set of related documents, like `users` or `appointments`
- Document: one record, like one patient or one appointment
- Field: one property, like `name` or `date`
- ObjectId: MongoDB’s default unique identifier for records
- Reference: a pointer from one document to another document using an ID
- Relationship: how documents connect to each other

### Actual Mongoose models in this project

| Collection / Model | Purpose | Important fields | Relationships | Used by |
|---|---|---|---|---|
| `User` | base account for login and role | `name`, `email`, `password`, `role`, `phone` | referenced by `Doctor` and `Patient` via `user` | auth, profile, role checks |
| `Doctor` | doctor profile and availability | `user`, `name`, `specialization`, `qualification`, `experience`, `hospital`, `location`, `consultationFee`, `availability` | references `User` | doctor search, slots, appointments |
| `Patient` | patient profile | `user`, `name`, `age`, `gender`, `phone`, `location` | references `User` | patient dashboards, booking |
| `Hospital` | hospital information | `name`, `location`, `contact`, `totalBeds`, `availableBeds`, `facilities` | no direct user relationship | hospital listing |
| `Appointment` | appointment booking | `patient`, `doctor`, `date`, `time`, `status`, `reason`, `notes` | references `User` (patient) and `Doctor` | booking, status updates |
| `Prescription` | medical prescription | `patient`, `doctor`, `appointment`, `diagnosis`, `medications`, `followUpDate` | references `User`, `Doctor`, `Appointment` | prescription creation and viewing |

### User model details
`User.js` stores the common login account data.
Important fields:
- `name` — user’s full name
- `email` — unique login email
- `password` — hashed before save
- `role` — one of `patient`, `doctor`, `admin`
- `phone` — optional contact number
- timestamps — created automatically

### Doctor model details
`Doctor.js` adds healthcare-specific information:
- `user` — reference to the related User record
- `name` — doctor’s name
- `email` — doctor email
- `specialization` — field like General Physician or Dermatologist
- `qualification` — academic qualification
- `experience` — years of experience
- `hospital` — hospital/clinic name
- `location` — clinic or district
- `consultationFee` — price or free consultation
- `availability` — weekly schedule with days and time slots
- `rating`, `totalConsultations`, `isActive` — operational fields

### Patient model details
`Patient.js` stores patient profile information:
- `user` — reference to the user account
- `name`
- `age`
- `gender`
- `phone`
- `location`
- `bloodGroup`
- `emergencyContact`
- `medicalHistory`

### Hospital model details
`Hospital.js` stores healthcare facility data:
- `name`
- `location`
- `contact`
- `totalBeds`
- `availableBeds`
- `type`
- `emergencyServices`
- `facilities`

### Appointment model details
`Appointment.js` stores appointment data:
- `patient` — reference to `User`
- `doctor` — reference to `Doctor`
- `patientName`, `patientPhone`, `patientAge`, `patientGender` — snapshot of patient details
- `date`, `time`
- `status` with allowed values:
  - `Pending`
  - `Confirmed`
  - `Cancelled`
  - `Completed`
  - `Rejected`
- `reason`, `notes`

Important relationship:
- `Patient` makes a request
- `Doctor` receives the appointment
- One appointment belongs to one doctor and one patient account

### Prescription model details
`Prescription.js` stores clinical notes and medication information:
- `patient` — reference to patient user
- `doctor` — reference to doctor profile
- `appointment` — reference to the exact appointment
- `diagnosis`
- `medications` — nested list with name, dosage, frequency, duration
- `instructions`
- `notes`
- `followUpDate`

This model is designed so each prescription is tied to one real appointment. That matters because a prescription belongs to an actual patient visit and an actual doctor interaction.

### Actual relationships between core records
- `User` → `Doctor` / `Patient` relationship via `user`
- `Appointment` → `Doctor` reference and `patient` reference
- `Prescription` → `Appointment` reference, plus `doctor` and `patient` references

This pattern allows the app to show:
- which patient booked which appointment
- which doctor handled the visit
- which prescription came from that appointment

---

## 8. Database Architecture

### Database architecture diagram
```text
MongoDB Atlas
├── User
│   ├── patient accounts
│   ├── doctor accounts
│   └── admin accounts
├── Doctor
│   ├── user reference
│   ├── specialization, qualification, experience
│   ├── hospital, location, availability
│   └── consultation details
├── Patient
│   ├── user reference
│   ├── age, gender, location, phone
│   └── medical details
├── Hospital
│   ├── name, location, contact
│   ├── totalBeds, availableBeds
│   └── facilities
├── Appointment
│   ├── patient reference
│   ├── doctor reference
│   ├── date, time, status, reason
│   └── notes
└── Prescription
    ├── patient reference
    ├── doctor reference
    ├── appointment reference
    ├── diagnosis
    └── medications + follow-up notes
```

### Primary identifiers and references
MongoDB documents get their own `_id` values (`ObjectId`). References are used to connect the records:
- a `Doctor` has `user` pointing to the related `User`
- an `Appointment` has a `doctor` and `patient` reference
- a `Prescription` has a `doctor`, `patient`, and `appointment` reference

This is better than copying all patient or doctor details into appointment records because it keeps data organized and consistent.

### One-to-many and many-to-one structure
Examples:
- One `User` can have one `Doctor` profile or one `Patient` profile
- One `Doctor` can have many appointments
- One `Patient` can have many appointments
- One `Appointment` can have at most one prescription because the model uses `unique: true` on the `appointment` field

### Unique constraints and validation
Important validations present in the models:
- `User.email` is unique
- `Appointment` has a compound index on doctor/date/time/status to help enforce uniqueness for active bookings
- `Prescription.appointment` is unique to prevent duplicate prescriptions for the same appointment
- required fields are enforced in models such as name, date, diagnosis, medication fields

### Why prescription linkage to appointment matters
The prescription is tied to a real appointment record, not just a loose doctor/patient relationship. This matters because:
- it proves the prescription belongs to a real visit
- it prevents duplicate prescriptions for one appointment
- it allows doctors to issue prescriptions only for their own appointments
- it allows patients to view records tied to actual booked medical visits

---

## 9. Dataset / Data Used

### Is there a real-world external dataset?
No. The repository does not contain a real-world public healthcare dataset being used for training or production. There is no external Kaggle dataset or real patient data imported into the app.

### What data is actually used?
The project uses application seed data and demo records. This data is created by seed scripts rather than downloaded externally.

### Where does the data come from?
The source is the seed system:
- `backend/src/seed/seedData.js`
- `backend/src/seed/seed.js`

These files define:
- demo credentials
- sample doctors
- sample patients
- sample hospitals
- appointment samples

### What is seeded?
The seed script creates:
- admin user
- doctor user
- patient user
- multiple sample doctors with different specializations
- sample patients from rural healthcare contexts
- hospitals with bed counts and facilities
- appointment examples

### Is it persistent?
Yes, it is stored in MongoDB Atlas if the app is connected to the database and the seed script is run.

### Is the data temporary?
The seed script is intended for development/demoing and is designed to avoid constant duplicates by checking existing records. It is not a one-time mock dataset used just for a demo screenshot; it is the actual application sample content for local development and testing.

### Why this data was used
The seed data reflects the project’s rural healthcare scenario and helps simulate real usage:
- doctors across specializations
- patients in local village/town areas
- hospitals with bed counts
- appointment flows

This makes the project easier to demonstrate and test without manually entering large amounts of data each time.

---

## 10. Authentication and Authorization

### Authentication = “Who are you?”
Authentication answers the question: “Are you the person you say you are?”

In this project, authentication is handled through:
- user email + password
- backend validation
- JWT token generation

### Authorization = “What are you allowed to do?”
Authorization answers: “Once you are logged in, what actions can you perform?”

The app uses role-based access control in `authMiddleware.js`.

### Actual login flow
The user enters email and password in the React UI.
Then the request proceeds as follows:
`React form → authService.login() → /api/auth/login → Express route → authController.login() → User model → JWT → frontend stores token → role-based dashboard`

### Password handling
The `User` model uses `bcryptjs` before storing password data:
- password is hashed before save
- login uses `matchPassword()` to compare hashed values

### JWT token generation
The project contains a token utility in:
- `backend/src/utils/generateToken.js`

The token is issued after successful login and used in the `Authorization` header as a Bearer token.

### Protected routes
Protected route checks happen in `authMiddleware.js`:
- `protect` ensures a valid JWT is present
- `authorize(...roles)` checks whether the user’s role is allowed

### Roles in this project
#### Patient
A patient can:
- log in
- view available doctors
- book appointments
- view their own appointments
- cancel their own appointments
- view their own prescriptions

#### Doctor
A doctor can:
- log in
- view doctor-specific appointments
- update appointment status
- create prescriptions for own appointments
- view their own prescriptions
- update doctor profile and availability

#### Admin
An admin can:
- view dashboard statistics
- view doctor records and patient records
- toggle doctor active/inactive status

Admin is restricted to admin-only access and cannot use patient/doctor-only prescription endpoints because those routes require role checks.

### Prescription authorization specifics
This is implemented in the code:
- doctors can create prescriptions only for appointments where they are the assigned doctor
- appointments must be in `Confirmed` or `Completed` status
- each appointment can have only one prescription
- patients can only view their own prescriptions
- doctors can only view their own prescriptions
- admin is not allowed to access the patient/doctor prescription routes

---

## 11. Appointment Pipeline

The appointment workflow is a core part of the project.

### End-to-end appointment process
`Patient selects doctor → chooses date/time → React sends request → Vite proxy forwards /api → Express route → Controller validates → Duplicate check → MongoDB save → Response → UI update`

### Actual booking logic
The booking logic is in `appointmentController.js`.

Important steps:
1. Validate the presence of `doctorId`, `date`, `time`, and `reason`
2. Verify the doctor actually exists
3. Check if another active appointment is already reserved for the same doctor/date/time
4. If it exists, return `409 Conflict` with the slot-unavailable message
5. Otherwise create the appointment record in MongoDB
6. Populate doctor and patient data for the response
7. Send a success response with `201 Created`

### Duplicate slot protection
This logic is very important because it prevents the same doctor slot from being booked twice.

The actual check is:
- same `doctor`
- same `date`
- same `time`
- status in `Pending` or `Confirmed`

If this is found, the request is rejected.

This prevents two patients from booking the same consultation slot.

### Appointment status states
The actual status values supported are:
- `Pending`
- `Confirmed`
- `Cancelled`
- `Completed`
- `Rejected`

### Verified behaviour during testing
The development checks specifically verified:
- successful booking returns HTTP `201`
- duplicate slot attempt returns HTTP `409` with the “slot no longer available” style response as implemented in the code

This means the duplicate prevention works, which is essential for a real healthcare booking system.

---

## 12. E-Prescription Pipeline

The e-prescription workflow is implemented and connected to the doctor dashboard and patient dashboard.

### The actual workflow
`Doctor opens appointment → checks patient details → creates prescription → enters diagnosis → adds medicines → dosage/frequency/duration → notes/instructions → follow-up date → API sends data → backend validates → MongoDB stores prescription → patient can view the record`

### Prescription creation logic
`createPrescription()` in `prescriptionController.js` validates:
- appointment ID must exist
- diagnosis must exist
- at least one medicine entry must exist
- doctor must own the appointment
- appointment status must be `Confirmed` or `Completed`
- duplicate prescription for the same appointment is not allowed

### Medicines structure
Each medicine entry includes:
- name
- dosage
- frequency
- duration

### Patient viewing logic
Patients and doctors can fetch prescription records through:
- `GET /api/prescriptions`
- `GET /api/prescriptions/:id`

The logic checks role and ownership to ensure the user only sees authorized records.

### Why the prescription is linked to appointment
This makes the prescription clinical and traceable. It proves a prescription was produced for a real appointment rather than a free-form note.

### Actual access rules
- Doctor: only their own prescriptions
- Patient: only their own prescriptions
- Admin: not allowed to access this route set

---

## 13. API Architecture

The API is mounted in `backend/src/routes/index.js` under `/api`.

### Actual API route table

| Method | Endpoint | Purpose | Role/access | Handler |
|---|---|---|---|---|
| GET | `/api/health` | Health check | Public | `index.js` |
| POST | `/api/auth/register` | Register a patient or doctor | Public | `authController.register` |
| POST | `/api/auth/login` | Login user | Public | `authController.login` |
| GET | `/api/auth/me` | Get current user | Private | `authController.getMe` |
| GET | `/api/doctors` | List all active doctors | Public | `doctorController.getDoctors` |
| GET | `/api/doctors/:id` | Get doctor details | Public | `doctorController.getDoctorById` |
| GET | `/api/doctors/:id/available-slots` | Get free slots | Public | `doctorController.getAvailableSlots` |
| PUT | `/api/doctors/profile` | Update doctor profile | Doctor only | `doctorController.updateDoctorProfile` |
| PUT | `/api/doctors/availability` | Update doctor schedule | Doctor only | `doctorController.updateDoctorAvailability` |
| POST | `/api/appointments` | Create appointment | Private (patient auth) | `appointmentController.createAppointment` |
| GET | `/api/appointments` | Get appointments | Private, role-based | `appointmentController.getAppointments` |
| GET | `/api/appointments/:id` | Get one appointment | Private, role-based | `appointmentController.getAppointmentById` |
| PUT | `/api/appointments/:id/status` | Update appointment status | Private | `appointmentController.updateAppointmentStatus` |
| DELETE | `/api/appointments/:id` | Cancel/delete appointment | Private | `appointmentController.deleteAppointment` |
| GET | `/api/hospitals` | List hospitals | Public | `hospitalController.getHospitals` |
| GET | `/api/hospitals/:id` | Get details for one hospital | Public | `hospitalController.getHospitalById` |
| GET | `/api/prescriptions` | View prescriptions | Patient or doctor only | `prescriptionController.getMyPrescriptions` |
| POST | `/api/prescriptions` | Create prescription | Doctor only | `prescriptionController.createPrescription` |
| GET | `/api/prescriptions/:id` | View one prescription | Patient or doctor only | `prescriptionController.getPrescriptionById` |
| GET | `/api/admin/stats` | Dashboard statistics | Admin only | `adminController.getAdminStats` |
| GET | `/api/admin/doctors` | View all doctors | Admin only | `adminController.getAdminDoctors` |
| GET | `/api/admin/patients` | View all patients | Admin only | `adminController.getAdminPatients` |
| PATCH | `/api/admin/doctors/:id/toggle-status` | Activate/inactivate doctor | Admin only | `adminController.toggleDoctorStatus` |

### HTTP status codes actually relevant here
- 200: successful reads or updates
- 201: successful creation
- 400: bad input validation
- 401: missing/invalid auth token
- 403: forbidden role or ownership mismatch
- 404: not found
- 409: slot already occupied or duplicate prescription
- 500: server processing error

---

## 14. Codespaces and Vite Proxy

### What happened in browser testing
During browser testing, the frontend was initially configured to call the backend using:
`http://localhost:5000/api`

This configuration worked inside the same Codespace environment, but it failed when the application was opened in the user’s normal browser. The root issue was that:
- `localhost` in a browser means “this computer”
- the browser is not running inside the Codespace container
- therefore, the browser tried to reach the user’s own machine instead of the Codespace backend

This is why the browser showed a generic “Network Error.”

### Why the public forwarded backend URL was not the final fix
The project later tested the public forwarded backend URL from the Codespaces forwarding system. However, that URL was protected by the Codespaces authentication tunnel and returned an HTTP 302 redirect to the GitHub sign-in flow. That meant the browser was redirected to GitHub Codespaces sign-in rather than receiving the app data.

### Final development fix
The final working solution is the Vite proxy configuration.

The frontend now uses a relative API path:
- `/api`

and the Vite dev server proxies it to:
- `http://localhost:5000`

This means the browser never calls the public forwarded backend URL directly. Instead, the browser calls the local Vite dev server, which forwards the request to the backend running inside the Codespace.

### Why this works
Because the frontend dev server is running on the same machine/browser environment as the user, and the backend is also running locally inside the Codespace, the browser does not need to directly connect to a public forwarded port. The Vite proxy handles the request internally.

### Important note
This is a development architecture fix. In production, a deployed application would normally use a different hosting and routing model, such as a public backend host or a reverse proxy configuration.

---

## 15. Git and GitHub

### Git
Git is a version control system used to track changes in files.

It helps developers:
- save versions of the code
- go back to earlier states if needed
- work on features safely
- collaborate with others

### GitHub
GitHub is an online platform for hosting Git repositories. It allows code to be stored remotely and shared with other developers or instructors.

### Important Git concepts
- repository: a project folder tracked by Git
- commit: a saved version of the project
- push: upload local changes to GitHub
- pull: get changes from GitHub
- branch: a separate line of development
- `.gitignore`: a file that tells Git which files not to track

### What happened in this project
The project was initialized as a Git repository and configured with a `.gitignore` file. Project files were committed and pushed to GitHub. Later, the prescription-related files were added to version control, committed, and pushed as part of project completion.

### Why `.env` should not be committed
Environment files contain sensitive values such as:
- MongoDB connection strings
- JWT secret values
- local development settings

The project’s `.gitignore` excludes `.env` files intentionally. This ensures secrets are not uploaded to GitHub.

---

## 16. Testing and Verification

The project was verified through a combination of code inspection and actual API testing.

### Authentication tests
These were verified in the backend:
- Admin login using the seeded admin account
- Patient login using the seeded patient account
- Doctor login using the seeded doctor account

### Doctor listing tests
The API was tested to confirm that doctor records are returned successfully and filtered data works as expected.

### Appointment tests
These were verified:
- successful appointment booking returns `201 Created`
- duplicate booking on same slot returns `409 Conflict`
- appointment data is correctly returned for the logged-in user

### Hospital listing tests
Hospital records and beds data were retrieved successfully from the backend.

### Prescription tests
The following were verified:
- doctor can create a prescription for a confirmed/completed appointment
- patient can view their own prescriptions
- doctor can view their own prescriptions
- admin cannot access prescription routes that are forbidden
- duplicate prescription prevention works when trying to create a second prescription for the same appointment

### Browser testing
Browser testing identified the initial Codespaces localhost issue:
- browser loaded frontend through a forwarded public URL
- requests to localhost were actually reaching the user’s local machine instead of the Codespace backend

The diagnosis showed:
- `localhost` is not the same as the Codespace container
- the public forwarded backend URL required sign-in/redirect
- the final working fix was the Vite proxy route to `http://localhost:5000`

### API-tested vs browser-tested vs build-tested
The project was validated in different ways:
- API-tested: backend endpoints were called directly and responded successfully
- browser-tested: the browser runtime issue was diagnosed and the forwarded-port issue was confirmed
- build-tested: frontend build and app logic were checked as part of the development process

Important note: not every feature was manually clicked through in a browser after the final development fix, but the backend logic and the frontend configuration were both validated in the live environment.

---

## 17. Complete End-to-End Pipeline

### Full system flow
`User → Browser → React UI → Vite dev server → API request → /api proxy → Node.js backend → Express routes → Middleware → Controller → Mongoose Model → MongoDB Atlas → Result → JSON response → React updates UI`

### Explanation of each stage
- User: opens the website in browser
- Browser: loads the frontend app
- React UI: displays forms, dashboards, tables, and buttons
- Vite dev server: handles local development and proxies /api requests
- API request: Axios sends requests to `/auth`, `/doctors`, `/appointments`, etc.
- Express backend: routes the request to the correct function
- Middleware: validates JWT and role
- Controller: runs business logic
- Model: interacts with MongoDB
- MongoDB Atlas: stores and returns data
- JSON response: backend sends structured data back
- React updates: interface refreshes with new data

### Example: login
- User enters credentials
- React sends POST to `/api/auth/login`
- Express checks email/password with `User` model
- JWT is generated and returned
- React stores token and redirects to dashboard

### Example: doctor discovery
- User visits the doctor list page
- React calls `/api/doctors`
- Express queries all active doctors
- MongoDB returns records
- React renders cards with doctor names, hospital, location, and specialization

### Example: appointment booking
- User selects a doctor and slot
- React calls `/api/appointments`
- Express validates and checks duplicate slot
- If available, a new appointment is created in MongoDB
- Frontend shows success confirmation

### Example: duplicate booking attempt
- Same slot is selected again by another user or repeated request
- Backend finds conflicting appointment record and returns `409`
- React informs user that the slot is no longer available

### Example: doctor creating prescription
- Doctor reviews patient appointment
- Doctor fills diagnosis and medicine list
- React sends POST to `/api/prescriptions`
- Express verifies appointment ownership and status
- Database stores the prescription
- Doctor sees a success message

### Example: patient viewing prescription
- Patient opens dashboard
- Frontend requests `/api/prescriptions`
- Backend returns only records belonging to that patient
- React renders list of prescriptions and details

### Example: admin dashboard
- Admin logs in
- React calls `/api/admin/stats`
- Backend aggregates counts from patients, doctors, hospitals, and appointments
- React displays metrics and recent appointment data

---

## 18. Security

The project includes some important security features in the codebase, but not every possible security layer.

### Password handling
The project uses `bcryptjs` to hash passwords before saving them in MongoDB.

### Authentication
The app uses JWT tokens to identify the logged-in user.

### Authorization
The backend restricts routes by role using `authorize()` and `protect()`.

### Role checks
The actual code checks role before permitting access to:
- admin-only routes
- doctor-only routes
- patient-only route operations

### Protected routes
Examples:
- `/api/appointments` requires authentication
- `/api/admin` routes require admin authorization
- prescription creation requires doctor access

### Environment variables
Sensitive values are kept in `.env` files and not committed to GitHub. The project uses `.gitignore` to keep environment files out of version control.

### MongoDB credentials
The connection string is not placed in source code and should remain in the backend environment file. It must not be committed or pasted into repository files that are tracked by Git.

### Duplicate prevention
The app prevents duplicate booking and duplicate prescriptions in actual controller logic.

### Input validation
The models and controllers validate required fields such as:
- email format
- minimum password length
- required doctor, patient, and appointment details
- required prescription medicines and diagnosis

### Important reminder
This is a project-level healthcare management application with core security measures, but it is not a full production-grade security system with every enterprise-grade safeguard. The implemented project is a functioning MERN academic and project-demo healthcare app.

---

## 19. Project Folder Structure

```text
/workspaces/mp1
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── authController.js
│   │   │   ├── doctorController.js
│   │   │   ├── hospitalController.js
│   │   │   └── prescriptionController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── Appointment.js
│   │   │   ├── Doctor.js
│   │   │   ├── Hospital.js
│   │   │   ├── Patient.js
│   │   │   ├── Prescription.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── doctorRoutes.js
│   │   │   ├── hospitalRoutes.js
│   │   │   ├── index.js
│   │   │   └── prescriptionRoutes.js
│   │   ├── seed/
│   │   │   ├── seed.js
│   │   │   └── seedData.js
│   │   └── utils/
│   │       └── generateToken.js
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── ...
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   └── routing/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AppointmentsPage.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── DoctorProfilePage.jsx
│   │   │   ├── FindDoctorsPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── HospitalsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── RegisterPage.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── appointmentService.js
│   │   │   ├── authService.js
│   │   │   ├── doctorService.js
│   │   │   └── hospitalService.js
│   │   └── utils/
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── ...
├── .gitignore
├── package.json
├── prompt.txt
├── README.md
└── ...
```

### What each major folder is for
- `frontend/` — user interface and visual application
- `backend/` — server logic, routes, controllers, models, and database logic
- `backend/src/seed/` — demo data seeding scripts
- `backend/src/models/` — MongoDB schema definitions
- `backend/src/routes/` — HTTP endpoint registration
- `backend/src/controllers/` — business logic implementation
- `backend/src/middleware/` — auth and error logic
- `frontend/src/services/` — API communication layer
- `frontend/src/pages/` — dashboard and page screens
- `frontend/src/context/` — authentication state

---

## 20. Presentation / PPT Quick Reference

### Title
Reaching the Unreached

### Problem Statement
Healthcare access remains difficult for rural and underserved communities, especially when patients need to find doctors, book appointments, and manage follow-up care.

### Proposed Solution
A MERN-based healthcare platform that connects patients, doctors, hospitals, and administrators through a digital appointment and prescription system.

### Objectives
- improve healthcare accessibility
- support patient-doctor booking
- reduce appointment confusion and duplicate scheduling
- allow digital prescriptions
- provide admin-level oversight

### Target Users
- Patients
- Doctors
- Hospitals
- Admins

### Technology Stack
- MongoDB
- Express.js
- React
- Node.js
- Vite
- Mongoose
- JWT
- Tailwind CSS

### Why MERN
MERN is well-suited for a full-stack web application where a data-heavy backend and interactive frontend are both needed.

### System Architecture
Frontend → Vite → API → Express → MongoDB Atlas

### Database Architecture
Users, doctors, patients, hospitals, appointments, and prescriptions exist as MongoDB documents and connected records.

### Main Modules
- Auth and role management
- Doctor discovery
- Appointment booking
- Hospital listing
- Prescription generation and retrieval
- Admin statistics

### Authentication
JWT-based secure login and role enforcement.

### Appointment Workflow
Doctor search → slot selection → booking → duplicate prevention → status updates.

### E-Prescription Workflow
Confirmed appointment → doctor creates prescription → patient views prescription.

### Testing
API and logic validation for login, appointment booking, duplicate booking prevention, and prescriptions.

### Security
Password hashing, JWT, role-based access, and protected routes.

### Development Journey
Project built from a starter workspace, audited, connected to MongoDB Atlas, APIs tested, browser issue diagnosed, and final Vite dev proxy fix applied.

### Current Status
The project is implemented and verified for the core functional features described above.

### Future Scope
The repository does not include unimplemented features as completed work. Any future additions would need to be intentionally added to the codebase.

---

## 21. Viva Questions

### Why MERN?
Because it combines a scalable database (MongoDB), a backend API layer (Express), a runtime environment (Node.js), and an interactive frontend (React) in one coherent stack.

### Why MongoDB?
MongoDB is easy to use for flexible, document-based data such as patients, doctors, appointments, and prescriptions.

### What is Express?
Express is a minimal Node.js framework used to create routes and APIs.

### What is Node.js?
Node.js runs JavaScript on the server, allowing the backend to work outside the browser.

### What is React?
React is a library for building interactive user interfaces with reusable components.

### What is an API?
An API is a way for different software parts to communicate. In this project, the frontend communicates with the backend through REST APIs.

### What is REST?
REST is a set of conventions for creating web services using HTTP methods like GET and POST.

### What is JSON?
JSON is the format used to send structured data between frontend and backend.

### What is a route?
A route is a URL path that maps to a specific backend handler, such as `/api/auth/login`.

### What is a controller?
A controller contains the main logic for handling a request after the route matches.

### What is a model?
A model defines the structure of a MongoDB collection and how documents should look.

### What is Mongoose?
Mongoose is a library that helps define schemas and work with MongoDB in Node.js.

### What is MongoDB Atlas?
MongoDB Atlas is the cloud-hosted database service used for the project.

### What is authentication?
Authentication checks who the user is.

### What is authorization?
Authorization checks what the user is allowed to do after login.

### How does appointment booking work?
A patient selects a doctor and time, the frontend sends the data to `/api/appointments`, and the backend verifies availability before saving the record.

### How is duplicate booking prevented?
The backend checks for an existing appointment with the same doctor, date, and time and rejects it with a conflict response.

### How does prescription creation work?
A doctor creates a prescription using appointment data, diagnosis, and medications, and the backend stores it linked to the appointment.

### How are patient and doctor records connected?
By MongoDB references such as `user`, `doctor`, and `patient` IDs in the models.

### Why use ObjectId references?
ObjectId references allow related records to be connected without copying all data redundantly.

### What happens when a patient logs in?
The app verifies the account, generates a JWT token, stores it locally, and loads the patient dashboard.

### What happens when a doctor creates a prescription?
The backend validates the appointment, checks ownership, saves the prescription, and returns a success response.

### What happened with Codespaces localhost?
The browser on the user’s own machine was trying to reach `localhost:5000`, which refers to the user’s local machine, not the remote Codespace container. That caused connection failures.

### Why was Vite proxy used?
The Vite proxy ensures the browser calls `/api`, which is then forwarded to the local backend inside the Codespace. This avoids the public forwarded backend URL and avoids the Codespaces authentication redirect.

### What is Git?
Git is version control software used to track code changes and preserve project history.

### What is GitHub?
GitHub is the hosting platform for Git repositories.

### What is `.gitignore`?
It tells Git which files to ignore, such as secrets and environment configuration files.

---

## 22. Final Project Status

### Implemented modules
The following modules are present and functional in the codebase:
- authentication and role management
- doctor listing and filters
- hospital listing
- appointment booking and duplicate protection
- admin statistics and doctor toggling
- doctor profile and availability management
- e-prescription creation and viewing
- patient/doctor dashboard interfaces

### Database status
MongoDB Atlas integration is implemented and configured through the backend environment file. The project uses Mongoose models and seed data to populate needed demo records.

### Backend status
The backend is structured with Express routes, middleware, controllers, and models. It exposes a defined set of REST APIs and handles validation and role-based authorization.

### Frontend status
The frontend is implemented with React + Vite and includes the major pages and dashboards for patient, doctor, and admin workflows.

### E-prescription status
The e-prescription workflow is implemented and integrated with the backend and dashboard UI.

### Git/GitHub status
The project is tracked in Git and stored on GitHub. Environment files are kept out of version control using `.gitignore`.

### Development environment status
The dev setup uses a local backend running on port 5000 and a Vite frontend with a proxy to that backend. This is the final development pattern for a Codespaces environment.

### Known limitations
The project is well-structured and functionally implemented for the scope described in the repository, but it is still a project implementation rather than a production-scale hospital system. Important limitations include:
- no external live hospital or patient data integration
- no payment/payment gateway module
- no SMS or notification system
- no telemedicine/video consultation features
- no enterprise-level production deployment setup

This is a valid project implementation for the requirement set, but it remains a development-focused application within the stated technical scope.

---

## Final Note
This project is a complete MERN stack healthcare access and appointment management platform for rural communities. It connects patients, doctors, hospitals, and administrators through a practical web application that handles registration, authentication, appointment booking, doctor scheduling, hospital information, and prescription workflows.

The README is meant to be both technically accurate and beginner-friendly so it can be used for project explanation, viva preparation, PPT preparation, and report writing.
