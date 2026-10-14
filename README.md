# MediCare Pro - Full-Stack Doctor & Clinic Website Demo

**MediCare Pro** is a modern, production-grade website and management platform designed for doctors, outpatient medical clinics, and healthcare practices. It combines a patient-facing web presence with a real-time appointment booking engine and a protected administrative console.

> **Demonstration & Compliance Notice:**  
> This application is configured with fictional demonstration records (doctor credentials, sample patients, contact numbers, and illustrative testimonials) for prospective practice presentations. No actual Protected Health Information (PHI) is collected. Prior to clinical production deployment, configure jurisdiction-appropriate HIPAA / GDPR safeguards.

---

## Architecture Overview

```
medicare-pro/
├── index.html                   # HTML5 entry with Plus Jakarta Sans & SEO meta tags
├── metadata.json                # Project capabilities & permissions
├── package.json                 # Full-stack dependencies and NPM scripts
├── server.ts                    # Express backend + Vite middleware on port 3000
├── tsconfig.json                # Strict TypeScript configuration
├── vite.config.ts               # Tailwind CSS v4 & React bundler configuration
├── .env.example                 # Configuration variables & secrets templates
├── .gitignore                   # Ignore rules for node_modules, .env, and dist
├── src/
│   ├── assets/
│   │   └── images/              # High-fidelity clinical photography & doctor portraits
│   ├── components/
│   │   ├── Navbar.tsx           # Strict 3-zone Top Bar Contract navigation
│   │   ├── Footer.tsx           # Accessible footer with practice hours & legal disclaimers
│   │   ├── DemoNoticeBanner.tsx # Non-intrusive demo disclaimer with admin shortcut
│   │   ├── BookingModal.tsx     # Step-by-step appointment booking wizard with live slots
│   │   └── AppointmentLookupModal.tsx # Public reference tracker for patient status
│   ├── context/
│   │   └── ClinicContext.tsx    # Reactive provider for doctor, clinic, and services state
│   ├── pages/
│   │   ├── HomePage.tsx         # Hero, trust strip, facilities, services, FAQs, CTAs
│   │   ├── AboutPage.tsx        # Doctor biography, education, credentials, philosophy
│   │   ├── ServicesPage.tsx     # Services catalog, fee schedule, configurable specialty modules
│   │   ├── ContactPage.tsx      # Clinic coordinates, map placeholder, and inquiry form
│   │   └── AdminDashboard.tsx   # Protected admin area: bookings table, settings, diagnostics
│   ├── server/
│   │   ├── db/
│   │   │   ├── connect.ts       # Unified MongoDB Atlas connector with memory demo fallback
│   │   │   ├── models.ts        # Mongoose schemas & compound slot indexes
│   │   │   ├── seedData.ts      # Seed records for doctor, clinic, services, and slots
│   │   │   └── seedRunner.ts    # Standalone database population script
│   │   ├── middleware/
│   │   │   ├── auth.ts          # JWT token generation & admin route verification
│   │   │   └── rateLimiter.ts   # Rate limiting & brute-force safeguard
│   │   ├── routes/
│   │   │   ├── auth.ts          # Admin authentication & session verification
│   │   │   ├── public.ts        # Public profile, clinic settings, active services, slots
│   │   │   ├── appointments.ts  # Booking creation, reference generator, public lookup
│   │   │   ├── inquiries.ts     # Public contact inquiry submission
│   │   │   └── admin.ts         # Administrative CRUD, rescheduling, status management
│   │   ├── services/
│   │   │   ├── notificationService.ts # Notification abstraction (Email / SMS / WhatsApp)
│   │   │   └── slotManager.ts   # Working hours math, slot calculation, conflict prevention
│   │   └── tests/
│   │       └── apiTests.ts      # Automated self-diagnostic suite
│   ├── types/
│   │   └── index.ts             # Shared domain TypeScript definitions
│   ├── App.tsx                  # Root layout, routing, modal orchestration
│   ├── index.css                # Tailwind CSS v4 styling & typography
│   └── main.tsx                 # React 19 bootstrap entry
```

---

## Key Features

1. **Dual In-Person & Telehealth Scheduling**:
   - Computes open time slots dynamically according to daily clinic operating hours.
   - Automatically handles clinic closures and scheduled holidays.
   - Generates unique human-readable booking reference codes (e.g. `MCP-2610-8421`).

2. **Double-Booking & Conflict Prevention**:
   - Both client and server validate that requested slots are unoccupied.
   - When administrators confirm or reschedule bookings, the database enforces single-reservation constraints to prevent overlapping appointments.

3. **Secure Administrative Suite**:
   - Protected with bcrypt password hashing and 24-hour signed JSON Web Tokens (JWT).
   - Real-time appointment management (Approve, Reschedule, Complete, Cancel).
   - Real-time editing of Doctor Biography, Clinic Information, Consultation Fees, and Daily Operating Hours. Changes persist to the database immediately.

4. **Honest Notification Abstraction**:
   - Pluggable provider architecture for SendGrid (Email) and Twilio (WhatsApp/SMS).
   - **Zero False Deliveries**: If external provider credentials are not configured, the system logs the event internally in demo mode without claiming false external delivery.

5. **Self-Diagnostic Test Suite**:
   - Built-in verification testing for booking validation, slot conflict prevention, and JWT security, executable directly from the Admin Dashboard or command line.

---

## Local Development & Setup

### Prerequisites
- Node.js (version 20+ recommended)
- NPM or PNPM

### 1. Installation
```bash
git clone <repository-url>
cd medicare-pro
npm install
```

### 2. Environment Setup
Copy the sample environment file:
```bash
cp .env.example .env
```
Key configuration settings:
- `PORT=3000`: Application port.
- `MONGODB_URI`: (Optional) Your MongoDB Atlas connection URI. If omitted or left as a placeholder, the app operates out-of-the-box with an in-memory persistent demo store!
- `ADMIN_DEFAULT_EMAIL`: `admin@medicarepro.demo`
- `ADMIN_DEFAULT_PASSWORD`: `ClinicAdmin2026!`

### 3. Running Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## MongoDB Atlas Setup (Optional Production Persistence)

To connect a live MongoDB Atlas cluster:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a Database User with read/write privileges under **Database Access**.
3. Under **Network Access**, allow your IP address (or `0.0.0.0/0` for cloud deployment).
4. In **Database Deployments**, click **Connect** → **Drivers** (Node.js) and copy the connection string.
5. Paste into `.env`:
   ```env
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.yourdomain.mongodb.net/medicare_pro?retryWrites=true&w=majority"
   ```
6. Run the database seed script to populate initial records:
   ```bash
   npm run seed
   ```

---

## Default Admin Credentials

To access the `/admin` console:
- **Email**: `admin@medicarepro.demo`
- **Password**: `ClinicAdmin2026!`

*(A 1-click credential filler button is provided on the admin login screen for fast evaluator review).*

---

## Running the Automated Test Suite

Execute the automated self-diagnostic test suite via terminal:
```bash
npm run test:diagnostics
```
Or open the **Admin Dashboard** → click the **Self-Diagnostic Suite** tab → click **Run Diagnostics Now** to verify validation rules and conflict safeguards live in the browser.

---

## REST API Documentation

### Public Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/public/profile` | Fetches doctor profile, title, bio, and credentials |
| `GET` | `/api/public/clinic` | Fetches clinic settings, address, and operating hours |
| `GET` | `/api/public/services` | Fetches active medical consultation services and fees |
| `GET` | `/api/public/specialties` | Fetches list of clinic specialties and modules |
| `GET` | `/api/public/slots?date=YYYY-MM-DD` | Returns open/booked slots for a specific date |
| `POST` | `/api/appointments` | Creates a new appointment booking request |
| `GET` | `/api/appointments/lookup/:ref` | Public status lookup by booking reference code |
| `POST` | `/api/inquiries` | Submits a patient message from the contact page |

### Protected Administrative Endpoints (Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Validates credentials and returns JWT token |
| `GET` | `/api/auth/me` | Validates active session token |
| `GET` | `/api/admin/stats` | Aggregated appointment counts and pending inquiries |
| `GET` | `/api/admin/appointments` | Lists appointments with status/date/search filtering |
| `PATCH` | `/api/admin/appointments/:id/status` | Confirms, completes, or cancels an appointment |
| `PATCH` | `/api/admin/appointments/:id/reschedule` | Reschedules appointment with collision detection |
| `DELETE` | `/api/admin/appointments/:id` | Permanently deletes an appointment record |
| `GET` | `/api/admin/inquiries` | Lists inquiries with status filter |
| `PATCH` | `/api/admin/inquiries/:id` | Updates inquiry status (reviewed, resolved) |
| `PUT` | `/api/admin/clinic` | Updates clinic metadata, operating hours, and holidays |
| `PUT` | `/api/admin/profile` | Updates doctor profile and credentials |
| `POST` | `/api/admin/services` | Adds a new consultation service |
| `PUT` | `/api/admin/services/:id` | Modifies an existing service |
| `DELETE` | `/api/admin/services/:id` | Removes a service |
| `GET` | `/api/diagnostics/tests` | Runs the automated system diagnostic test suite |

---

## Troubleshooting

- **Slot shows "Clinic is closed on this date"**:
  Check the date selected. The clinic schedule is closed on Sundays and designated holidays (e.g. New Year's Day, Thanksgiving). Working hours can be adjusted in the Admin Settings tab.
- **Port 3000 in use**:
  Set `PORT=3001` in `.env` or terminate the existing Node process using port 3000 (`kill -9 $(lsof -t -i:3000)`).
- **Session Expired in Admin**:
  JWT tokens are configured for a 24-hour expiration window. Log in again with `admin@medicarepro.demo`.
