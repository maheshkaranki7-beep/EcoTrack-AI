# EcoTrack AI — Full-stack capstone starter

Implements the main presentation workflow: citizen reporting, admin review/worker assignment, worker collection updates, report tracking and admin analytics.

## Stack
Frontend: HTML/CSS/JavaScript · Backend: Node.js/Express · Database: MySQL · Auth: JWT + bcrypt · Optional AI: Python/FastAPI placeholder.

## Setup
1. Install Node.js 18+ and MySQL 8+.
2. Create database/tables: `mysql -u root -p < database/schema.sql`
3. Configure backend: copy `backend/.env.example` to `backend/.env`, then set your MySQL password and a long random JWT_SECRET.
4. Run backend:
   `cd backend`
   `npm install`
   `npm run seed`
   `npm run dev`
5. Open `frontend/index.html` with VS Code Live Server. API default is `http://localhost:5000/api`.

Demo accounts (all use password `EcoTrack@123`):
- admin@ecotrack.local
- worker@ecotrack.local
- citizen@ecotrack.local

Change demo credentials before deployment.

## Main workflow
Citizen submits a report with category, description, location and optional image. Admin assigns it to a worker using the worker's user ID (seeded worker is user ID 2 in a fresh database). Worker marks it In Progress and then Resolved, optionally entering collected weight. Admin dashboard shows database-backed counts.

## Notes
- Passwords are bcrypt hashed; protected APIs use JWT and server-side role checks.
- SQL uses parameterized queries. Image uploads are limited to 5 MB and JPG/PNG/WEBP.
- `Active Users` means accounts marked active, not people currently online.
- AI endpoint is a placeholder, not a trained classifier. Train/evaluate a model before claiming real AI predictions.
- Maps, push notifications, route optimization, automated tests and production deployment are documented future tasks.
