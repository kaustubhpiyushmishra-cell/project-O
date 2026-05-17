# Project O — High Level Design Document

> Real-time 1v1 video networking and mentorship platform for college students.

---

## 1. System Overview

Project O is a full-stack web application that enables college students to connect via live video calls in two modes: **spontaneous random matching** (Fun 1v1) and **structured mentorship booking** (Guided 1v1). The system is built on a decoupled frontend-backend architecture with real-time WebSocket communication for matchmaking and WebRTC signaling.

### Key System Properties
- **Authentication**: Passwordless OTP via college email (domain-whitelisted)
- **Real-Time**: Socket.IO for matchmaking state and WebRTC signaling
- **Video**: Peer-to-peer via browser WebRTC (no media server)
- **Persistence**: PostgreSQL for durable data, Redis for ephemeral state
- **Security**: Multi-layer (JWT, rate limiting, Helmet CSP, auto-moderation)

---

## 2. Architecture Diagram

```mermaid
graph TB
    subgraph Client["Browser (Next.js 16)"]
        UI["React UI<br/>App Router + Tailwind"]
        CTX["Context Providers<br/>Auth | Match | Notification"]
        HOOKS["Hooks<br/>useAuth | useMatch | useWebRTC"]
        AXIOS["Axios Client<br/>JWT Interceptor"]
        SIO_C["Socket.IO Client<br/>/match | /signaling"]
        WEBRTC["WebRTC<br/>PeerConnection"]
    end

    subgraph Server["Backend (Express.js)"]
        MW["Middleware Stack<br/>Helmet | CORS | RateLimit | Auth | Validate"]
        API["REST API<br/>9 Route Modules"]
        CTRL["Controllers<br/>Auth | User | Mentorship | Session<br/>Rating | Safety | Admin | Wallet"]
        SVC["Services<br/>MatchingService | OTPService"]
        SOCK["Socket.IO Server<br/>/match | /signaling"]
    end

    subgraph Data["Data Layer"]
        PG["PostgreSQL 16<br/>7 Tables | 13 Indexes"]
        REDIS["Redis 7<br/>OTP | Queue | Presence | Cache"]
    end

    subgraph External["External Services"]
        SMTP["SMTP Server<br/>(Gmail/SendGrid)"]
        STUN["Google STUN<br/>stun.l.google.com"]
    end

    UI --> CTX
    CTX --> HOOKS
    HOOKS --> AXIOS
    HOOKS --> SIO_C
    HOOKS --> WEBRTC

    AXIOS -->|"REST API (HTTPS)"| MW
    SIO_C -->|"WebSocket"| SOCK
    WEBRTC -->|"P2P Media"| STUN

    MW --> API
    API --> CTRL
    CTRL --> SVC
    SVC --> PG
    SVC --> REDIS
    CTRL --> PG
    CTRL --> REDIS
    SOCK --> SVC

    SVC -->|"Send OTP"| SMTP
```

---

## 3. Component Breakdown

### Frontend Components

| Component | Responsibility |
|-----------|---------------|
| **App Router** | File-based routing, layouts, metadata, Suspense loading states |
| **AuthProvider** | JWT lifecycle, localStorage hydration, login/logout/updateUser |
| **MatchProvider** | Socket.IO match queue FSM (idle → queued → matched → in-call) |
| **NotificationProvider** | Toast notifications with auto-dismiss and progress animation |
| **useWebRTC** | Full WebRTC lifecycle: getUserMedia → PeerConnection → signaling → cleanup |
| **AuthGuard** | Route protection, onboarding redirect, loading spinner |
| **AppLayout** | Authenticated shell with sidebar navigation (desktop) + hamburger (mobile) |
| **API Client** | 9 typed modules, JWT interceptor, global 401 handler |
| **Socket Manager** | Singleton Socket.IO clients per namespace, JWT auth handshake |

### Backend Components

| Component | Responsibility |
|-----------|---------------|
| **server.js** | Express app, HTTP server, Socket.IO attachment, boot sequence |
| **Middleware Stack** | Security headers, CORS, rate limiting, JWT auth, input validation |
| **Controllers (8)** | Request handling, business logic, response formatting |
| **MatchingService** | Redis FIFO queue, block-list filtering, session creation, presence |
| **OTPService** | Secure OTP generation, Redis storage (5min TTL), email delivery |
| **Socket Namespaces (2)** | `/match` (queue events), `/signaling` (WebRTC relay) |
| **Validators (12)** | Zod schemas for all mutating endpoints |

---

## 4. Frontend HLD

### Page Architecture
```mermaid
graph LR
    subgraph Public
        LP["/ Landing"]
        LG["/login"]
        SU["/signup"]
    end

    subgraph Protected["Protected (AuthGuard)"]
        DB["/dashboard"]
        MT["/mentors"]
        MP["/mentors/:id"]
        CR["/call/random"]
        CRM["/call/room"]
        PR["/profile"]
        PS["/profile/setup"]
        WL["/wallet"]
        HI["/history"]
        AD["/admin"]
    end

    LP --> LG
    LP --> SU
    LG --> DB
    SU --> PS
    PS --> DB
    DB --> CR
    DB --> MT
    MT --> MP
    CR --> CRM
    DB --> WL
    DB --> HI
    DB --> AD
```

### State Flow
```mermaid
sequenceDiagram
    participant U as User
    participant AG as AuthGuard
    participant AP as AuthProvider
    participant API as Backend API
    participant LS as localStorage

    U->>AG: Navigate to /dashboard
    AG->>AP: Check isAuthenticated
    AP->>LS: Read token + user
    alt Token exists
        AP->>API: GET /user/profile (validate)
        API-->>AP: User data
        AP-->>AG: isAuthenticated = true
        AG-->>U: Render page
    else No token
        AG-->>U: Redirect to /login
    end
```

---

## 5. Backend HLD

### Request Pipeline
```mermaid
graph LR
    REQ["HTTP Request"] --> HELM["Helmet"]
    HELM --> CORS["CORS"]
    CORS --> RL["Rate Limiter"]
    RL --> JSON["JSON Parser"]
    JSON --> AUTH["JWT Auth"]
    AUTH --> VAL["Zod Validate"]
    VAL --> CTRL["Controller"]
    CTRL --> DB["PostgreSQL/Redis"]
    DB --> RES["JSON Response"]
```

### Socket Pipeline
```mermaid
graph LR
    CONN["Socket Connect"] --> SA["Socket Auth<br/>(JWT + Ban Check)"]
    SA --> NS["Namespace Handler"]
    NS --> SVC["Service Layer"]
    SVC --> REDIS["Redis"]
    SVC --> PG["PostgreSQL"]
    SVC --> EMIT["Emit to Peers"]
```

### Module Dependency Graph
```
server.js
├── config/index.js (env vars)
├── middlewares/ (auth, rateLimiter, validate)
├── routes/index.js
│   ├── authRoutes → authController → otpService → redis
│   ├── userRoutes → userController → pool + redis (cache)
│   ├── mentorshipRoutes → mentorshipController → pool
│   ├── sessionRoutes → sessionController → pool
│   ├── ratingRoutes → ratingController → pool
│   ├── safetyRoutes → safetyController → pool
│   ├── adminRoutes → adminController → pool + matchingService
│   └── walletRoutes → walletController → pool
├── sockets/
│   ├── matchSocket → matchingService → redis + pool
│   └── signalingSocket (stateless relay)
└── db/ (pool, redis, schema)
```

---

## 6. Database HLD

### Schema Overview
```mermaid
erDiagram
    USERS ||--o{ MENTORSHIP_REQUESTS : "requests as student"
    USERS ||--o{ MENTORSHIP_REQUESTS : "receives as mentor"
    USERS ||--o{ SESSIONS : "participates"
    USERS ||--o{ RATINGS : "rates"
    USERS ||--o{ RATINGS : "is rated"
    USERS ||--o{ REPORTS : "reports"
    USERS ||--o{ REPORTS : "is reported"
    USERS ||--o{ BLOCKED_USERS : "blocks"
    USERS ||--o{ TRANSACTIONS : "owns"
    SESSIONS ||--o{ RATINGS : "has"
    SESSIONS }o--o| MENTORSHIP_REQUESTS : "linked to"

    USERS {
        uuid id PK
        varchar email UK
        varchar name
        varchar college
        text[] interests
        int reputation
        bool is_mentor
        varchar mentor_status
        int wallet_balance
        bool is_banned
    }

    SESSIONS {
        uuid id PK
        uuid user1_id FK
        uuid user2_id FK
        enum type
        enum status
        uuid mentorship_id FK
        int duration_sec
    }

    MENTORSHIP_REQUESTS {
        uuid id PK
        uuid requester_id FK
        uuid mentor_id FK
        enum status
        varchar topic
        timestamptz scheduled_at
    }

    RATINGS {
        uuid id PK
        uuid session_id FK
        uuid rater_id FK
        uuid rated_id FK
        smallint score
        text comment
    }

    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        enum type
        int amount
        text description
    }
```

### Redis Key Schema
| Pattern | Type | TTL | Purpose |
|---------|------|-----|---------|
| `otp:{email}` | String | 300s | OTP storage for verification |
| `match:queue` | List | — | FIFO matchmaking queue |
| `match:presence:{userId}` | String | 300s | Online status indicator |
| `match:session:{sessionId}` | Hash | 3600s | Active session metadata |
| `cache:mentors:all` | String | 60s | Cached mentor listing |

---

## 7. API Communication Flow

### Random Matching Flow
```mermaid
sequenceDiagram
    participant U1 as User 1
    participant MS as Match Socket (/match)
    participant RS as Redis Queue
    participant U2 as User 2

    U1->>MS: emit("join_queue")
    MS->>RS: RPUSH match:queue, user1
    MS-->>U1: emit("queued")

    U2->>MS: emit("join_queue")
    MS->>RS: LRANGE + check blocks
    MS->>RS: LREM user1 (atomic)
    MS->>RS: HSET session:{id}
    MS-->>U1: emit("matched", {sessionId, partnerId})
    MS-->>U2: emit("matched", {sessionId, partnerId})
```

### WebRTC Signaling Flow
```mermaid
sequenceDiagram
    participant U1 as User 1 (Caller)
    participant SS as Signaling Socket
    participant U2 as User 2 (Callee)

    U1->>SS: emit("join_session", {sessionId})
    U2->>SS: emit("join_session", {sessionId})
    SS-->>U1: emit("peer_joined")

    U1->>U1: createOffer()
    U1->>SS: emit("offer", {sessionId, offer})
    SS-->>U2: emit("offer", {offer})

    U2->>U2: setRemoteDescription + createAnswer()
    U2->>SS: emit("answer", {sessionId, answer})
    SS-->>U1: emit("answer", {answer})

    U1->>SS: emit("ice_candidate", {candidate})
    SS-->>U2: emit("ice_candidate", {candidate})
    U2->>SS: emit("ice_candidate", {candidate})
    SS-->>U1: emit("ice_candidate", {candidate})

    Note over U1,U2: P2P Media Stream Established
```

---

## 8. Authentication Architecture

```mermaid
graph TB
    subgraph Login Flow
        E["Enter Email"] --> V["Validate Domain"]
        V --> OTP["Generate OTP<br/>(crypto.randomInt)"]
        OTP --> STORE["Store in Redis<br/>(5min TTL)"]
        STORE --> SEND["Send via SMTP"]
        SEND --> ENTER["Enter OTP"]
        ENTER --> CHECK["Verify vs Redis"]
        CHECK --> UPSERT["Upsert User<br/>(PostgreSQL)"]
        UPSERT --> BAN{"Banned?"}
        BAN -->|Yes| REJECT["403 Forbidden"]
        BAN -->|No| JWT["Sign JWT<br/>(7d expiry)"]
        JWT --> CLIENT["Store in localStorage"]
    end

    subgraph Every Request
        CLIENT --> INTERCEPT["Axios Interceptor<br/>Bearer Token"]
        INTERCEPT --> MIDDLEWARE["authMiddleware<br/>jwt.verify()"]
        MIDDLEWARE --> HANDLER["Route Handler"]
    end
```

---

## 9. Deployment Architecture

```mermaid
graph TB
    subgraph Docker Compose
        FE["Frontend Container<br/>Next.js Standalone<br/>Port 3000"]
        BE["API Container<br/>Express + Socket.IO<br/>Port 5000"]
        PG["PostgreSQL 16<br/>Port 5432<br/>Persistent Volume"]
        RD["Redis 7<br/>Port 6379<br/>AOF + LRU 128MB"]
    end

    FE -->|"REST + WS"| BE
    BE -->|"SQL"| PG
    BE -->|"Commands"| RD

    FE -.->|"healthcheck"| BE
    BE -.->|"healthcheck"| PG
    BE -.->|"healthcheck"| RD
```

---

## 10. Scaling Strategy

```mermaid
graph LR
    subgraph Current["Current (Single Node)"]
        N1["1x Next.js"]
        E1["1x Express"]
        P1["1x PostgreSQL"]
        R1["1x Redis"]
    end

    subgraph Scaled["Scaled (Multi-Node)"]
        CDN["CDN / Vercel Edge"]
        LB["Load Balancer"]
        E2["N x Express Pods"]
        RA["Redis Adapter<br/>(Socket.IO)"]
        PGB["PgBouncer"]
        PR["PostgreSQL<br/>Primary + Replicas"]
        RC["Redis Cluster"]
        TURN["TURN Server<br/>(Coturn)"]
    end

    N1 -.-> CDN
    E1 -.-> LB
    LB --> E2
    E2 --> RA
    RA --> RC
    E2 --> PGB
    PGB --> PR
    E2 --> TURN
```

| Layer | Current | Phase 2 | Phase 3 |
|-------|---------|---------|---------|
| Frontend | Single container | Vercel + CDN | Edge rendering |
| Backend | Single process | PM2 cluster (4 workers) | Kubernetes HPA |
| Database | Single PostgreSQL | PgBouncer + read replica | Citus/sharding |
| Cache | Single Redis | Redis Sentinel | Redis Cluster |
| WebSocket | In-memory map | Redis adapter | Dedicated WS service |
| Video | P2P (STUN only) | Add TURN server | SFU for group calls |

---

## 11. Security Architecture

```mermaid
graph TB
    subgraph Perimeter
        HELM["Helmet<br/>(CSP, HSTS, X-Frame)"]
        CORS["CORS<br/>(Origin Whitelist)"]
        HPP["HPP<br/>(Parameter Pollution)"]
        RL["Rate Limiter<br/>(100/15min, 5/15min auth)"]
    end

    subgraph Application
        JWT_V["JWT Verification"]
        ZOD["Zod Validation<br/>(12 schemas)"]
        ADMIN["Admin Email Gate"]
        BAN["Ban Check<br/>(REST + Socket)"]
    end

    subgraph Database
        PARAM["Parameterized Queries"]
        CHECK["CHECK Constraints<br/>(self-action prevention)"]
        UNIQUE["UNIQUE Constraints"]
    end

    subgraph Moderation
        AUTO["Auto-Ban<br/>(5+ pending reports)"]
        ADMIN_M["Admin Report Review<br/>(3+ resolved → ban)"]
    end

    HELM --> CORS --> HPP --> RL --> JWT_V --> ZOD --> ADMIN
    JWT_V --> BAN
    ZOD --> PARAM --> CHECK --> UNIQUE
    BAN --> AUTO
    ADMIN_M --> AUTO
```

---

## 12. External Services

| Service | Usage | Fallback |
|---------|-------|----------|
| Google STUN (`stun.l.google.com:19302`) | NAT traversal for WebRTC | Secondary STUN server configured |
| SMTP (Gmail/SendGrid) | OTP email delivery | Console log in development mode |
| PostgreSQL | Persistent data storage | Docker volume with auto-init schema |
| Redis | Ephemeral state (OTP, queue, presence, cache) | AOF persistence, LRU eviction at 128MB |

---

## 13. Data Flow

### User Registration → First Session
```
1. POST /auth/login {email} → Redis: SET otp:{email} → SMTP: send OTP
2. POST /auth/verify {email, otp} → Redis: GET+DEL otp → PostgreSQL: UPSERT user → JWT
3. POST /user/profile/complete {name, college} → PostgreSQL: UPDATE users
4. Socket /match: join_queue → Redis: RPUSH match:queue
5. Socket /match: matched {sessionId} → Redis: HSET session → PostgreSQL: INSERT session
6. Socket /signaling: join_session → offer → answer → ICE → P2P video established
7. Socket /match: skip → PostgreSQL: UPDATE session (ended) → Re-queue
8. POST /rating/submit {score} → PostgreSQL: INSERT rating → UPDATE reputation
```

---

## 14. Key Engineering Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Passwordless OTP** | No password storage, eliminates credential attacks | Depends on email delivery speed |
| **Redis matchmaking queue** | Sub-millisecond operations, atomic list operations | In-memory (requires persistence config) |
| **P2P WebRTC (no SFU)** | Zero media server cost, lowest latency for 1v1 | Fails behind strict NATs without TURN |
| **Socket.IO over raw WS** | Built-in reconnection, rooms, namespaces, fallback transport | Larger bundle than raw WebSocket |
| **PostgreSQL over MongoDB** | Relational integrity (FKs, constraints, enums), complex JOINs for history/ratings | Schema migrations needed for changes |
| **Zod over Joi** | TypeScript-first, smaller bundle, better inference | Less community middleware |
| **localStorage for JWT** | Simple, works across tabs | Vulnerable to XSS (mitigated by CSP) |
| **Client-side rendering** | Real-time state requires client-side Socket.IO/WebRTC | No SSR SEO for authenticated pages (acceptable) |
| **Monolith backend** | Simpler deployment, single codebase, shared Socket.IO state | Must refactor for microservices at scale |
| **Mentor cache (60s TTL)** | Reduces DB load on high-traffic listing page | Stale data for up to 60 seconds |

---

*Document Version: 1.0 — May 2026*
*Generated from live codebase analysis*
