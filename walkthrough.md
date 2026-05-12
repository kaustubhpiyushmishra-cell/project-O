# Project O — Development Walkthrough

## Phase 5: Production Hardening & Presence (COMPLETED)
Phase 5 focused on making Project O robust, secure, and real-time.

### Key Additions:
- **Security Hardening:** Integrated **Helmet.js** (CSP, headers) and **HPP** (parameter pollution) for enterprise-grade safety.
- **Presence Indicators:** Pulse green "Online" badges on mentor cards and profile pages, queried in real-time from Redis.
- **Premium Notification Center:** A custom toast-based system built with `framer-motion` to handle socket-emitted alerts (e.g. Mentor Approval, Match Timeouts).
- **Socket Connectivity:** Standardized `notification` events across the admin and matching systems.

---

## Phase 4: Admin, Wallet & Quality Control (COMPLETED)
Phase 4 connected the final "governance" pieces of the platform.

### Key Additions:
- **Admin Dashboard:** Real-time stats, mentor approval flow, and reporting system.
- **Wallet System:** Credit/Debit transaction ledger and balance management.
- **Session History:** Full logs of all past 1v1 and Guided calls.
- **Ratings & Reviews:** Post-session rating modal and public mentor feedback wall.
- **Profile Self-Editing:** Capability for users to update their persona and interests.

---

## Phase 3: Mentorship Booking & Guided WebRTC Sessions (COMPLETED)
Phase 3 implemented the explicit mentorship booking lifecycle.


### Key Additions:
- **Dynamic Bookings:** Dynamic `mentors/[id]` fetching mentor data. Booking interface `/booking/[id]` wires directly to `createRequest`.
- **Requests Dashboard:** Dual-pane UI `dashboard/requests` enabling Mentors to accept bookings and users to track statuses.
- **Guided Sessions:** Explicit routing to `/call/room/[sessionId]` which mounts WebRTC on exact rooms instead of the matching queue.
- **Backend Protection:** `sessionController.js` includes UPSERT logic to ensure both users clicking "Join Room" enter the *exact same room*.

---

## Phase 2: Onboarding & Mentor System
Phase 2 transformed the platform into a structured application with a mandatory onboarding flow and a complete mentor application system.

### Key Additions:
- **Profile System:** `is_mentor`, `mentor_status`, `mentor_rate`, `mentor_bio` columns added to `users` table.
- **Onboarding:** Mandatory `name` and `college` validation across the app via `AuthGuard`. New `/profile/setup` multi-step UI block.
- **Mentor Endpoints:** Real-time generation of listed mentors, alongside an application endpoint for users to apply.

---
## Project Structure

```
backend/
├── .env / .env.example
├── package.json
├── Dockerfile
├── docker-compose.yml
└── src/
    ├── server.js                  ← Entry point
    ├── config/index.js            ← Env config loader
    ├── db/
    │   ├── pool.js                ← PostgreSQL pool
    │   ├── redis.js               ← Redis client
    │   └── schema.sql             ← Full DB schema
    ├── controllers/
    │   ├── authController.js      ← Login (OTP) + Verify (JWT)
    │   ├── userController.js      ← Profile CRUD
    │   ├── matchController.js     ← Join/Leave/Next queue
    │   ├── mentorshipController.js← Request/Respond/List
    │   ├── sessionController.js   ← Create/Get/End sessions
    │   ├── ratingController.js    ← Submit + aggregate ratings
    │   └── safetyController.js    ← Report + Block users
    ├── services/
    │   ├── otpService.js          ← OTP gen, Redis store, email send
    │   └── matchingService.js     ← Redis FIFO queue + matching logic
    ├── middlewares/
    │   ├── auth.js                ← JWT verification
    │   └── rateLimiter.js         ← 100/15min general, 5/15min auth
    ├── routes/
    │   ├── index.js               ← Route aggregator
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── matchRoutes.js
    │   ├── mentorshipRoutes.js
    │   ├── sessionRoutes.js
    │   ├── ratingRoutes.js
    │   └── safetyRoutes.js
    └── sockets/
        ├── matchSocket.js         ← Real-time matching (/match)
        └── signalingSocket.js     ← WebRTC signaling (/signaling)
```

---

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/health` | No | Health check |
| **Auth** ||||
| `POST` | `/api/auth/login` | No | Send OTP to email |
| `POST` | `/api/auth/verify` | No | Verify OTP → JWT |
| **User** ||||
| `GET` | `/api/user/profile` | Yes | Get own profile |
| `PUT` | `/api/user/profile` | Yes | Update profile |
| `POST` | `/api/user/profile/complete`| Yes | Mandatory Onboarding Step |
| `GET` | `/api/user/mentors` | Yes | List Approved Mentors |
| `POST` | `/api/user/mentor-apply` | Yes | Apply for Mentor |
| `GET` | `/api/user/:id` | Yes | Get public profile |
| **Matching** ||||
| `POST` | `/api/match/join` | Yes | Join match queue |
| `POST` | `/api/match/leave` | Yes | Leave queue |
| `POST` | `/api/match/next` | Yes | Skip → re-queue |
| **Mentorship** ||||
| `POST` | `/api/mentorship/request` | Yes | Create request |
| `POST` | `/api/mentorship/respond` | Yes | Accept/Reject |
| `GET` | `/api/mentorship/list` | Yes | List requests |
| **Session** ||||
| `POST` | `/api/session/create` | Yes | Create session |
| `GET` | `/api/session/:id` | Yes | Get session info |
| `POST` | `/api/session/:id/end` | Yes | End session |
| **Rating** ||||
| `POST` | `/api/rating/submit` | Yes | Rate a session |
| `GET` | `/api/rating/user/:id` | Yes | User's ratings |
| **Safety** ||||
| `POST` | `/api/safety/report` | Yes | Report user |
| `POST` | `/api/safety/block` | Yes | Block user |
| `DELETE` | `/api/safety/block/:id` | Yes | Unblock user |
| `GET` | `/api/safety/blocked` | Yes | List blocked |

---

## WebSocket Namespaces

### `/match` — Real-time Matching
| Event | Direction | Payload |
|-------|-----------|---------|
| `join_queue` | Client → Server | — |
| `leave_queue` | Client → Server | — |
| [skip](file:///c:/Users/KIIT/Desktop/project%20O/backend/src/services/matchingService.js#106-122) | Client → Server | — |
| `matched` | Server → Client | `{ sessionId, partnerId }` |
| `queued` | Server → Client | `{ message }` |

### `/signaling` — WebRTC Relay
| Event | Direction | Payload |
|-------|-----------|---------|
| `join_session` | Client → Server | `{ sessionId }` |
| `offer` | Bidirectional | `{ sessionId, offer }` |
| `answer` | Bidirectional | `{ sessionId, answer }` |
| `ice_candidate` | Bidirectional | `{ sessionId, candidate }` |
| `peer_joined` | Server → Client | `{ userId }` |
| `peer_left` | Server → Client | `{ userId }` |

Both namespaces require JWT in `socket.handshake.auth.token`.

---

## Database Tables

| Table | Key Columns |
|-------|------------|
| `users` | id, email, name, college, branch, year, interests, reputation, is_banned |
| `mentorship_requests` | requester_id, mentor_id, status, scheduled_at, topic |
| `sessions` | user1_id, user2_id, type (casual/mentorship), status, duration_sec |
| `ratings` | session_id, rater_id, rated_id, score (1-5), comment |
| `reports` | reporter_id, reported_id, reason, status |
| `blocked_users` | blocker_id, blocked_id |

---

## Redis Keys

| Key Pattern | Type | TTL | Use |
|---|---|---|---|
| `match:queue` | List | — | FIFO matching queue |
| `match:presence:{userId}` | String | 5 min | Online presence |
| `match:session:{sessionId}` | Hash | 1 hr | Active session data |
| `otp:{email}` | String | 5 min | Pending OTP code |

---

## Getting Started

### Option 1: Docker (Recommended)
```bash
cd backend
cp .env.example .env
docker-compose up --build
```

### Option 2: Local
```bash
# Start PostgreSQL and Redis locally first
cd backend
cp .env.example .env      # edit DB credentials
npm install
# Run schema: psql -U postgres -d project_o -f src/db/schema.sql
node src/server.js
```

Server starts at `http://localhost:5000`.

---

## Verification

- ✅ 26 source files created (Phase 1)
- ✅ `npm install` — 132 packages, 0 errors
- ✅ Complete Phase 2 database migrations applied
- ✅ Next.js frontend wired to live mentor API endpoints
- ✅ Multi-step onboarding and Profile UI complete
- ✅ Phase 3 Explicit WebRTC Sessions wired into Dashboard
