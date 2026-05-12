# Project O

**Talk to seniors, learn faster.** A real-time 1v1 video networking and mentorship platform built exclusively for college students.

---

## Features

### 🎥 Fun 1v1 Zone
Random video conversations with peers from your college. Expand your network spontaneously — like Omegle, but safe and college-only.

### 📅 Guided 1v1 (Mentorship)
Browse verified senior mentors, book sessions, and get 1v1 career guidance, portfolio feedback, and interview prep via live video.

### 🛡️ Safety First
OTP-gated college email authentication, user reporting/blocking, admin moderation, and rate limiting ensure a secure environment.

### 💰 Wallet System
Built-in balance tracking, top-ups, and full transaction history for premium mentorship sessions.

### ⭐ Ratings & Reviews
Post-session rating system with mentor leaderboards and public review profiles.

### 🟢 Real-Time Presence
See which mentors are currently online via Redis-backed presence indicators.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | PostgreSQL 16 |
| **Cache/Queue** | Redis 7 (OTP, presence, matchmaking, mentor cache) |
| **Video** | WebRTC (peer-to-peer via Socket.IO signaling) |
| **Auth** | JWT + OTP (email-based, college domain whitelist) |
| **Containerization** | Docker, Docker Compose |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  Landing ─ Auth ─ Dashboard ─ Mentors ─ Call Rooms      │
│  Profile ─ Admin ─ Wallet ─ History                     │
└────────────────────┬────────────────────────────────────┘
                     │ REST (Axios) + WebSocket (Socket.IO)
┌────────────────────▼────────────────────────────────────┐
│               Express.js Backend (API)                   │
│  Auth ─ User ─ Mentorship ─ Session ─ Rating ─ Safety   │
│  Admin ─ Wallet ─ Matching ─ Signaling                  │
├────────────────────┬──────────────────┬─────────────────┤
│   PostgreSQL       │    Redis         │   WebRTC P2P    │
│   (users, sessions,│  (OTP, queue,    │   (video/audio  │
│    transactions,   │   presence,      │    streams)     │
│    ratings, etc.)  │   cache)         │                 │
└────────────────────┴──────────────────┴─────────────────┘
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Redis 7
- npm 10+

### 1. Clone & Install

```bash
git clone https://github.com/your-org/project-o.git
cd project-o

# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Environment Variables

**Frontend** — `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend** — `backend/.env` (see `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/project_o
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAILS=admin@kiit.ac.in
ALLOWED_DOMAINS=kiit.ac.in
```

### 3. Database Setup

```bash
# Create database and run schema
psql -U postgres -c "CREATE DATABASE project_o;"
psql -U postgres -d project_o -f backend/src/db/schema.sql
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
npm run dev
```

Frontend: [http://localhost:3000](http://localhost:3000)
Backend: [http://localhost:5000/health](http://localhost:5000/health)

---

## Docker Deployment

### Production (full stack)
```bash
docker compose -f docker-compose.production.yml up --build -d
```

This starts:
- **Frontend** (Next.js) on port `3000`
- **Backend** (Express) on port `5000`
- **PostgreSQL** on port `5432`
- **Redis** on port `6379`

---

## Testing

```bash
cd backend
npm test
```

Runs Jest test suites covering:
- **Auth**: College email domain validation
- **Wallet**: Amount validation, transaction types
- **Rating**: Score bounds, self-rating prevention, reputation logic
- **Booking**: Request validation, response actions, duplicate prevention

---

## API Reference

Full API documentation is available in [API_DOCS.md](./API_DOCS.md), covering:
- 25+ REST endpoints (Auth, User, Mentorship, Session, Rating, Safety, Admin, Wallet)
- 2 WebSocket namespaces (`/match` for matchmaking, `/signaling` for WebRTC)
- Error response formats and rate limits

---

## Project Structure

```text
project-o/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router pages
│   │   ├── admin/                # Admin dashboard
│   │   ├── call/                 # Video call rooms (random + guided)
│   │   ├── dashboard/            # User command center
│   │   ├── history/              # Session history
│   │   ├── login/ & signup/      # OTP authentication
│   │   ├── mentors/              # Mentor discovery + profiles
│   │   ├── profile/              # User profile + onboarding
│   │   └── wallet/               # Balance & transactions
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Glass cards, buttons, skeletons, modals
│   │   ├── sections/             # Landing page sections
│   │   └── auth/                 # Auth guards & layouts
│   ├── context/                  # React context providers
│   ├── hooks/                    # Custom hooks (useAuth, useMatch, etc.)
│   └── lib/                      # API client, socket, utilities
├── backend/
│   ├── src/
│   │   ├── controllers/          # Route handlers
│   │   ├── routes/               # Express routers
│   │   ├── services/             # Business logic (OTP, matching)
│   │   ├── middlewares/          # Auth, admin, rate limiting
│   │   ├── sockets/              # Socket.IO namespaces
│   │   ├── db/                   # PostgreSQL pool, Redis, schema
│   │   ├── validators/           # Zod input validation
│   │   └── config/               # Environment config
│   └── __tests__/                # Jest unit tests
├── Dockerfile                    # Frontend multi-stage build
├── docker-compose.production.yml # Full stack deployment
└── API_DOCS.md                   # Complete API reference
```

---

## License

This project is private and proprietary.
