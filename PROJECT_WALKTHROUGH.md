# Project O — Master Technical Walkthrough

> **Talk to seniors, learn faster.** A real-time 1v1 video networking and mentorship platform built exclusively for college students.

---

## 1. Project Overview

### Problem Statement
College students lack accessible, real-time channels to connect with senior peers for career guidance, interview prep, and spontaneous networking. Existing solutions are either too formal (LinkedIn) or unsafe (Omegle).

### Solution
Project O provides two core experiences:
1. **Fun 1v1 Zone** — Random peer-to-peer video calls (like Omegle, but college-gated and safe)
2. **Guided 1v1 (Mentorship)** — Browse verified senior mentors, book paid/free sessions, and get 1v1 video guidance

### User Journey
```
Landing Page → Sign Up (college email) → OTP Verification → Profile Setup (onboarding)
  → Dashboard (command center)
    ├── Fun 1v1: Join Queue → Matched → WebRTC Video Call → Rate Partner → Skip/End
    ├── Mentors: Browse → View Profile → Book Session → Mentor Accepts → Join Video Room
    ├── Wallet: Top-up balance → Pay for sessions → View transaction history
    ├── History: Review past sessions → Rate partners retroactively
    └── Admin (admins only): Approve mentors, review reports, ban users
```

### Core Features
| Feature | Description |
|---------|-------------|
| OTP Authentication | College-email-only, passwordless login via 6-digit OTP |
| Random Matching | Redis-backed queue with block-list filtering and timeout handling |
| WebRTC Video Calls | Peer-to-peer video/audio with STUN servers and Socket.IO signaling |
| Mentorship Booking | Request → Accept/Reject → Scheduled video session flow |
| Wallet System | Balance tracking, top-ups, and full transaction history |
| Ratings & Reputation | 1-5 star post-session ratings with auto-reputation scoring |
| Safety System | User reporting, blocking, auto-ban on 5+ pending reports |
| Admin Dashboard | Mentor approval, report management, platform statistics |
| Real-Time Presence | Redis-backed online indicators with 5-minute TTL |

---

## 2. Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend Framework | Next.js 16 (App Router) | SSR, file-based routing, Suspense loading |
| UI Library | React 19, TypeScript | Component architecture, type safety |
| Styling | Tailwind CSS 4, shadcn/ui | Utility-first CSS, accessible component primitives |
| Animations | Framer Motion | Page transitions, micro-animations, notification toasts |
| Backend | Node.js, Express.js | REST API server |
| Real-Time | Socket.IO | Matchmaking queue events, WebRTC signaling relay |
| Video | WebRTC (native) | Peer-to-peer video/audio streams |
| Database | PostgreSQL 16 | Persistent storage (users, sessions, ratings, reports) |
| Cache/Queue | Redis 7 | OTP storage, match queue, presence, mentor cache |
| Auth | JWT + OTP | Stateless authentication, email verification |
| Email | Nodemailer | OTP delivery via SMTP |
| Validation | Zod | Schema-based request validation |
| Security | Helmet, HPP, express-rate-limit | HTTP headers, parameter pollution, rate limiting |
| Containers | Docker, Docker Compose | Multi-stage builds, full-stack orchestration |
| HTTP Client | Axios | Frontend API communication with interceptors |

---

## 3. Project Structure

```
project-o/
├── src/                              # ── FRONTEND (Next.js) ──
│   ├── app/                          # App Router pages
│   │   ├── layout.tsx                # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx                  # Landing page (hero, features, how-it-works)
│   │   ├── globals.css               # Design system tokens + Tailwind config
│   │   ├── login/page.tsx            # OTP login form
│   │   ├── signup/page.tsx           # OTP signup form
│   │   ├── dashboard/               # User command center
│   │   │   ├── page.tsx              # Stats, recent activity, quick actions
│   │   │   ├── loading.tsx           # Skeleton loading state
│   │   │   └── requests/page.tsx     # Mentorship requests management
│   │   ├── call/                     # Video call rooms
│   │   │   ├── random/page.tsx       # Random matching lobby
│   │   │   ├── room/page.tsx         # Active call room (WebRTC)
│   │   │   ├── room/[id]/page.tsx    # Session-specific call room
│   │   │   └── [id]/page.tsx         # Guided (mentorship) call room
│   │   ├── mentors/                  # Mentor discovery
│   │   │   ├── page.tsx              # Search + grid of mentor cards
│   │   │   ├── loading.tsx           # Skeleton loading state
│   │   │   └── [id]/page.tsx         # Individual mentor profile + booking
│   │   ├── booking/[id]/page.tsx     # Booking confirmation flow
│   │   ├── profile/                  # User profile management
│   │   │   ├── page.tsx              # View/edit profile
│   │   │   ├── loading.tsx           # Skeleton loading state
│   │   │   └── setup/page.tsx        # First-time onboarding wizard
│   │   ├── wallet/                   # Financial management
│   │   │   ├── page.tsx              # Balance, top-up, transactions
│   │   │   └── loading.tsx           # Skeleton loading state
│   │   ├── history/                  # Session history
│   │   │   ├── page.tsx              # Past sessions list + ratings
│   │   │   └── loading.tsx           # Skeleton loading state
│   │   └── admin/                    # Admin dashboard
│   │       ├── page.tsx              # Stats, mentor approvals, reports
│   │       └── loading.tsx           # Skeleton loading state
│   ├── components/
│   │   ├── ui/                       # Reusable UI primitives
│   │   │   ├── glass-card.tsx        # Glassmorphism card with glow effects
│   │   │   ├── premium-button.tsx    # Animated button variants
│   │   │   ├── skeleton-loaders.tsx  # 8 page-specific skeleton components
│   │   │   ├── RatingModal.tsx       # Post-session star rating dialog
│   │   │   ├── wrap-shader.tsx       # WebGL shader background animation
│   │   │   ├── anime-navbar.tsx      # Landing page animated navbar
│   │   │   ├── lamp.tsx              # Decorative lamp glow effect
│   │   │   ├── lamp-footer.tsx       # Footer with lamp aesthetic
│   │   │   └── testimonial-slider.tsx # Testimonial carousel
│   │   ├── sections/                 # Landing page sections
│   │   │   ├── how-it-works.tsx      # Step-by-step feature explanation
│   │   │   └── stories-section.tsx   # User stories/testimonials
│   │   ├── layout/                   # Structural components
│   │   │   ├── app-layout.tsx        # Authenticated sidebar + content layout
│   │   │   ├── navbar.tsx            # Public-facing navigation bar
│   │   │   └── footer.tsx            # Public footer
│   │   └── auth/
│   │       ├── AuthGuard.tsx         # Route protection + onboarding redirect
│   │       └── auth-layout.tsx       # Login/signup shared layout
│   ├── context/                      # React context providers
│   │   ├── AuthProvider.tsx          # JWT auth state, login/logout, hydration
│   │   ├── MatchProvider.tsx         # Socket.IO match queue state machine
│   │   └── NotificationProvider.tsx  # Toast notification system
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts               # AuthContext consumer
│   │   ├── useMatch.ts              # MatchContext consumer
│   │   └── useWebRTC.ts             # Full WebRTC lifecycle management
│   └── lib/                          # Shared utilities
│       ├── api.ts                    # Axios client + 9 API modules + TypeScript types
│       └── socket.ts                 # Socket.IO client manager (match + signaling)
│
├── backend/                          # ── BACKEND (Express) ──
│   ├── src/
│   │   ├── server.js                 # Entry point: Express + Socket.IO + security
│   │   ├── config/index.js           # Centralized config from env vars
│   │   ├── controllers/              # Route handlers (business logic)
│   │   │   ├── authController.js     # Login (OTP send), Verify (JWT issue)
│   │   │   ├── userController.js     # Profile CRUD, mentor listing (cached)
│   │   │   ├── mentorshipController.js # Request/respond/list mentorship
│   │   │   ├── sessionController.js  # Create/get/end sessions, history
│   │   │   ├── ratingController.js   # Submit ratings, get user stats
│   │   │   ├── walletController.js   # Balance, transactions, add funds
│   │   │   ├── safetyController.js   # Report, block/unblock users
│   │   │   └── adminController.js    # Stats, mentor actions, report actions
│   │   ├── routes/                   # Express routers (9 modules)
│   │   ├── services/                 # Core business logic services
│   │   │   ├── matchingService.js    # Redis queue, presence, session mgmt
│   │   │   └── otpService.js         # OTP generation, Redis storage, email
│   │   ├── middlewares/
│   │   │   ├── auth.js               # JWT (REST + Socket), admin check
│   │   │   ├── rateLimiter.js        # General (100/15min) + auth (5/15min)
│   │   │   └── validate.js           # Zod schema middleware factory
│   │   ├── validators/index.js       # 12 Zod schemas for all endpoints
│   │   ├── sockets/
│   │   │   ├── matchSocket.js        # /match namespace (queue, skip, timeout)
│   │   │   └── signalingSocket.js    # /signaling namespace (offer/answer/ICE)
│   │   └── db/
│   │       ├── schema.sql            # Full PostgreSQL schema (7 tables)
│   │       ├── pool.js               # pg Pool (max 20, 2s timeout)
│   │       └── redis.js              # Redis client singleton
│   └── __tests__/                    # Jest unit tests (4 suites, 38 tests)
│       ├── auth.test.js              # College email domain validation
│       ├── wallet.test.js            # Amount validation, transaction types
│       ├── rating.test.js            # Score bounds, self-rating, reputation
│       └── booking.test.js           # Request validation, duplicates
│
├── Dockerfile                        # Frontend multi-stage build (3 stages)
├── docker-compose.production.yml     # Full stack: frontend + api + pg + redis
├── API_DOCS.md                       # Complete API reference
└── README.md                         # Production documentation
```

---

## 4. Frontend Architecture

### Routing (Next.js App Router)
All routes use the `app/` directory convention. Protected routes wrap content in `<AuthGuard>` + `<AppLayout>`. Each data-fetching route has a `loading.tsx` file for instant Suspense-based skeleton loading.

### State Management
Three React Context providers in the root layout:
1. **AuthProvider** — JWT token, user object, login/logout, localStorage hydration, auto-revalidation
2. **MatchProvider** — Socket.IO match queue state machine (`idle → connecting → queued → matched → in-call → disconnected`)
3. **NotificationProvider** — Global toast system with 4 types (success/error/warning/info), auto-dismiss, progress bar animation

### Design System
Custom warm palette defined in `globals.css` via Tailwind `@theme`:
- **Sunshine** `#FFC926` — Primary accent
- **Cream** `#F3E8CC` — Background
- **Carrot** `#F96015` — CTA/secondary
- **Tomato** `#D52518` — Destructive/error
- **Forest** `#18542A` — Text/foreground
- **Kiwi** `#9ABC05` — Success/online

Typography utilities: `.text-hero`, `.text-section`, `.text-card`, `.text-body`, `.text-caption`
Glassmorphism: `.glass-panel` (backdrop-blur + border + rounded)

### Component Library (19 components)
Key custom components: `GlassCard` (animated glow border), `PremiumButton` (3 variants with hover effects), `WrapShader` (WebGL canvas animation), `RatingModal` (5-star interactive dialog), `TestimonialSlider` (auto-scrolling carousel).

### API Integration
Centralized Axios client (`src/lib/api.ts`) with:
- Auto JWT injection via request interceptor
- Global 401 handler (auto-logout + redirect)
- 15s timeout
- 9 typed API modules: `authApi`, `userApi`, `matchApi`, `mentorshipApi`, `sessionApi`, `ratingApi`, `safetyApi`, `adminApi`, `walletApi`
- 12 TypeScript interfaces for full type safety

### Socket.IO Client
Singleton manager (`src/lib/socket.ts`) supporting two namespaces:
- `/match` — Queue events (queued, matched, partner_skipped, match_timeout)
- `/signaling` — WebRTC relay (offer, answer, ice_candidate, peer_joined/left)

Features: JWT auth handshake, auto-reconnection (10 attempts, exponential backoff), namespace isolation.

---

## 5. Backend Architecture

### Server (`server.js`)
Express app wrapped in `http.createServer` for Socket.IO attachment. Boot sequence: PostgreSQL connection test → Redis connect → HTTP listen.

### Security Stack
| Layer | Implementation |
|-------|---------------|
| HTTP Headers | `helmet()` with custom CSP directives |
| Rate Limiting | `express-rate-limit` — 100 req/15min (general), 5 req/15min (auth) |
| Parameter Pollution | `hpp()` middleware |
| CORS | Configured origin from env, credentials enabled |
| Auth | JWT verification on every protected route |
| Socket Auth | JWT + banned-user check on every socket connection |
| Input Validation | Zod schemas via `validate()` middleware factory |
| Admin Gate | Email whitelist check from `ADMIN_EMAILS` env var |

### Controller Architecture (8 controllers)
Each controller follows the pattern: validate → query → transform → respond. Error handling uses try/catch with PostgreSQL error code detection (e.g., `23505` for unique violations).

### Services
- **matchingService.js** — Redis-backed FIFO queue. `joinQueue()` scans for eligible candidates (excludes blocked users, checks presence), creates session in both Redis (1h TTL) and PostgreSQL. Socket registry maps userId → socket for cross-user event emission.
- **otpService.js** — Crypto-random 6-digit OTP, stored in Redis with 5-minute TTL. Development mode logs to console; production sends via Nodemailer/SMTP.

---

## 6. Database Design

### Entity Relationship
```
users (1) ──── (N) mentorship_requests (N) ──── (1) users
users (1) ──── (N) sessions (N) ──── (1) users
users (1) ──── (N) ratings
users (1) ──── (N) reports
users (1) ──── (N) blocked_users
users (1) ──── (N) transactions
sessions (1) ── (N) ratings
sessions (1) ── (0..1) mentorship_requests
```

### Tables (7)

| Table | Key Fields | Constraints |
|-------|-----------|-------------|
| `users` | id (UUID PK), email (UNIQUE), name, college, branch, year, interests (TEXT[]), reputation, is_mentor, mentor_status, mentor_rate, mentor_bio, is_banned, wallet_balance | year CHECK 1-6 |
| `mentorship_requests` | requester_id (FK), mentor_id (FK), message, status (ENUM), topic, scheduled_at | `different_users` CHECK |
| `sessions` | user1_id (FK), user2_id (FK), type (casual/mentorship), status (active/ended/missed), mentorship_id (FK), duration_sec | `different_session_users` CHECK |
| `ratings` | session_id (FK), rater_id (FK), rated_id (FK), score (1-5), comment | `unique_rating` UNIQUE, `different_rater` CHECK |
| `reports` | reporter_id (FK), reported_id (FK), reason, status (pending/reviewed/resolved/dismissed) | `different_reporter` CHECK |
| `blocked_users` | blocker_id (FK), blocked_id (FK) | `unique_block` UNIQUE |
| `transactions` | user_id (FK), type (credit/debit), amount (>0), description, ref_id | amount CHECK >0 |

### Indexes (13)
Strategic indexes on: `users(email)`, `users(college)`, `mentorship_requests(requester_id, mentor_id, status)`, `sessions(user1_id, user2_id, type)`, `ratings(rated_id)`, `reports(reported_id, status)`, `blocked_users(blocker_id, blocked_id)`, `transactions(user_id, created_at DESC)`.

### Triggers
`update_updated_at()` — Auto-sets `updated_at = NOW()` on UPDATE for `users` and `mentorship_requests`.

---

## 7. Authentication Flow

```
1. User enters college email
2. POST /api/auth/login → validates domain whitelist → generates 6-digit OTP → stores in Redis (5min TTL) → sends email
3. User enters OTP
4. POST /api/auth/verify → checks Redis → upserts user → checks ban status → signs JWT (7d expiry) → returns {token, user}
5. Frontend stores token + user in localStorage
6. AuthProvider hydrates from localStorage on mount → validates via GET /api/user/profile
7. Every API call: Axios interceptor attaches Bearer token
8. Every socket connection: handshake sends token → socketAuthMiddleware verifies + checks ban
9. On 401 response: Axios interceptor clears localStorage → redirects to /login
10. AuthGuard component: checks isAuthenticated → redirects to /login if false, /profile/setup if needsOnboarding
```

---

## 8. API Endpoint Reference

### Auth (2 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | No | Send OTP to email |
| POST | `/api/auth/verify` | No | Verify OTP, return JWT |

### User (6 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/user/profile` | JWT | Get own profile |
| PUT | `/api/user/profile` | JWT | Update profile fields |
| POST | `/api/user/profile/complete` | JWT | Complete onboarding |
| GET | `/api/user/mentors` | JWT | List approved mentors (cached) |
| POST | `/api/user/mentor-apply` | JWT | Apply to become a mentor |
| GET | `/api/user/:id` | JWT | Get public profile |

### Mentorship (3 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/mentorship/request` | JWT | Create booking request |
| POST | `/api/mentorship/respond` | JWT | Accept/reject request (mentor only) |
| GET | `/api/mentorship/list` | JWT | List requests (role + status filter) |

### Session (4 endpoints)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/session/create` | JWT | Create video session |
| GET | `/api/session/:id` | JWT | Get session details |
| POST | `/api/session/:id/end` | JWT | End active session |
| GET | `/api/session/history` | JWT | Paginated session history |

### Rating (2), Safety (4), Admin (5), Wallet (3) — 25+ total endpoints documented in `API_DOCS.md`.

### WebSocket Namespaces
| Namespace | Events | Purpose |
|-----------|--------|---------|
| `/match` | `join_queue`, `leave_queue`, `skip`, `queued`, `matched`, `match_timeout`, `partner_skipped`, `partner_disconnected` | Matchmaking state machine |
| `/signaling` | `join_session`, `offer`, `answer`, `ice_candidate`, `peer_joined`, `peer_left`, `leave_session` | WebRTC SDP/ICE relay |

---

## 9. Feature Development Phases

### Phase 1: MVP Core
- **Objective**: Passwordless auth + random video matching
- **Backend**: Auth controller, OTP service, matching service, session controller, Socket.IO namespaces
- **Frontend**: Landing page, login/signup, call room with WebRTC hook
- **Database**: users, sessions tables
- **Key Decision**: Redis for queue (FIFO with blocked-user filtering) over in-memory arrays

### Phase 2: User Persona & Onboarding
- **Objective**: Mandatory profile completion + mentor role system
- **Backend**: Profile CRUD, mentor application endpoint, admin approval flow
- **Frontend**: Onboarding wizard, AuthGuard with `needsOnboarding` redirect, profile page
- **Database**: Added mentor fields to users table

### Phase 3: Mentorship Ecosystem
- **Objective**: Full booking flow for guided 1v1 sessions
- **Backend**: Mentorship controller (create/respond/list), scheduled session creation
- **Frontend**: Mentor discovery page, mentor profile page, booking flow, requests dashboard
- **Database**: mentorship_requests table with status enum

### Phase 4: Admin, Wallet & Quality Control
- **Objective**: Platform governance + financial system
- **Backend**: Admin controller (stats, mentor/report actions), wallet controller (balance, transactions, funds), safety controller (report, block/unblock), rating controller
- **Frontend**: Admin dashboard, wallet page, history page, rating modal
- **Database**: ratings, reports, blocked_users, transactions tables

### Phase 5: Production Hardening
- **Objective**: Security + performance + stability
- **Backend**: Helmet CSP, HPP, rate limiting (general + auth), socket auth middleware with ban check, auto-ban on 5+ reports
- **Frontend**: Global 401 interceptor, notification provider, error boundaries
- **Infrastructure**: Docker Compose with healthchecks, PostgreSQL connection pooling (max 20)

### Phase 6: Performance & Visual Polish
- **Objective**: Perceived performance + premium feel
- **Backend**: Redis mentor cache (60s TTL) with live presence refresh
- **Frontend**: 8 skeleton loader components, 6 `loading.tsx` files for Suspense, WebGL shader animation, glassmorphism design system
- **Key Decision**: Cache mentor list without `isOnline` flag, refresh presence on read (fast Redis GET)

### Phase 7: Deployment & Documentation
- **Objective**: Production-ready handoff
- **Backend**: Hardened Dockerfile with HEALTHCHECK, non-root user
- **Frontend**: Multi-stage Dockerfile (deps → build → runner), standalone output
- **Docker Compose**: 4-service orchestration with health dependencies
- **Documentation**: README, API_DOCS, PROJECT_WALKTHROUGH, HLD

---

## 10. Deployment Architecture

### Docker Compose (Production)
```yaml
services:
  frontend:   # Next.js standalone (port 3000), depends on api
  api:        # Express + Socket.IO (port 5000), depends on postgres + redis
  postgres:   # PostgreSQL 16-alpine, schema auto-init, persistent volume
  redis:      # Redis 7-alpine, AOF persistence, 128MB LRU eviction
```

All services have health checks. Frontend waits for API; API waits for both databases.

### Frontend Dockerfile (3-stage)
1. **deps** — `npm ci` (production + dev modules separately)
2. **builder** — `npm run build` (Next.js standalone output)
3. **runner** — Copy standalone + static assets, run as non-root `nextjs` user

### Backend Dockerfile
Single stage: `npm ci --omit=dev`, HEALTHCHECK via wget, non-root `node` user.

### Environment Variables

**Frontend** (`.env.local`):
| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL |

**Backend** (`.env`):
| Variable | Purpose | Required in Prod |
|----------|---------|:---:|
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment mode | Yes |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | Token signing key | Yes |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) | No |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Email delivery | Yes |
| `CORS_ORIGIN` | Allowed frontend origin | Yes |
| `COLLEGE_EMAIL_DOMAINS` | Comma-separated domain whitelist | No |
| `ADMIN_EMAILS` | Comma-separated admin email list | Yes |
| `MATCH_TIMEOUT` | Queue timeout seconds (default: 60) | No |

---

## 11. Security Practices

| Area | Implementation |
|------|---------------|
| Authentication | Passwordless OTP (no passwords stored), JWT with 7-day expiry |
| Authorization | Per-route `authMiddleware`, admin email whitelist, socket-level JWT + ban check |
| Input Validation | Zod schemas on every mutating endpoint (12 schemas) |
| Rate Limiting | 100 req/15min general, 5 req/15min auth (prevents OTP brute-force) |
| HTTP Security | Helmet (CSP, HSTS, X-Frame-Options, etc.), HPP |
| Database | Parameterized queries only (no string interpolation), constraint checks |
| Self-Action Prevention | Database CHECK constraints prevent self-rating, self-booking, self-reporting, self-blocking |
| Auto-Moderation | 5+ pending reports → auto-ban; 3+ resolved reports → auto-ban |
| Ban Enforcement | Checked on JWT verification, socket connection, and user upsert |
| Secrets | Production startup validates required env vars, `.env` files gitignored |
| Container Security | Non-root users in both Docker images |

---

## 12. Performance Optimization

| Area | Technique |
|------|-----------|
| Mentor Listing | Redis cache (60s TTL), presence refreshed on read |
| Database | Connection pool (max 20, 2s timeout), strategic indexes (13) |
| Frontend Loading | Suspense `loading.tsx` skeleton states on all data routes |
| Bundle | Next.js standalone output mode for minimal production bundle |
| WebSocket | Namespace isolation, lazy socket initialization, 10-attempt reconnection |
| Docker | Multi-stage builds, production-only dependencies |
| Redis | LRU eviction policy (128MB cap), AOF persistence |
| Pagination | All list endpoints support `limit`/`offset` with max caps |

---

## 13. Scalability Plan

| Dimension | Current | Scale Path |
|-----------|---------|------------|
| Database | Single PostgreSQL | Read replicas → connection pooler (PgBouncer) → sharding by college |
| Cache | Single Redis | Redis Cluster / Sentinel for HA |
| Backend | Single Express process | PM2 cluster mode → Kubernetes pods with HPA |
| WebSocket | In-memory socket registry | Redis adapter for Socket.IO (multi-process support) |
| Video | P2P via STUN | Add TURN server for NAT traversal, SFU for group calls |
| Frontend | Single Next.js instance | Vercel/CDN deployment with edge caching |
| Storage | None (no file uploads) | S3/GCS for profile pictures, session recordings |
| Queue | Redis list | BullMQ for job scheduling (email, notifications) |

---

## 14. Developer Onboarding Guide

### Prerequisites
- Node.js 20+, npm 10+, PostgreSQL 16, Redis 7

### Local Setup
```bash
# Clone
git clone https://github.com/kaustubhpiyushmishra-cell/project-O.git
cd project-O

# Frontend
npm install

# Backend
cd backend && npm install && cd ..

# Database
psql -U postgres -c "CREATE DATABASE project_o;"
psql -U postgres -d project_o -f backend/src/db/schema.sql

# Environment
cp .env.example .env.local          # Frontend
cp backend/.env.example backend/.env # Backend (set JWT_SECRET, SMTP creds)

# Run
# Terminal 1: cd backend && npm run dev
# Terminal 2: npm run dev
```

### Testing
```bash
cd backend && npm test   # 4 suites, 38 tests
npx next build           # TypeScript check + production build
```

### Docker Deployment
```bash
docker compose -f docker-compose.production.yml up --build -d
```

---

## 15. Known Gaps & Future Improvements

| Gap | Impact | Suggested Fix |
|-----|--------|---------------|
| No TURN server | WebRTC fails behind strict NATs/firewalls | Deploy Coturn or use Twilio TURN |
| No file uploads | No profile pictures or attachments | Add multer + S3/GCS storage |
| No payment gateway | Wallet is simulated (no real payments) | Integrate Razorpay/Stripe |
| No push notifications | Users miss booking responses | Add FCM/web push via service worker |
| No email notifications | No booking confirmation emails | Add transactional email templates |
| Socket.IO in-memory | Can't scale beyond 1 process | Add `@socket.io/redis-adapter` |
| No end-to-end tests | UI flows untested | Add Playwright/Cypress test suite |
| No session recording | No replay capability | Add MediaRecorder + cloud storage |
| No refresh token | JWT expires after 7 days with no renewal | Implement refresh token rotation |
| No SSR data fetching | All pages are client-rendered | Move to React Server Components for initial data |

---

*Generated from codebase analysis — May 2026*
