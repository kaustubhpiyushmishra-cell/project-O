# Project O — API Documentation

## Base URL
```
Development: http://localhost:5000/api
Production:  https://api.projecto.app/api
```

## Authentication
All protected endpoints require a **Bearer token** in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

Tokens are obtained via the `/auth/verify` endpoint after OTP validation.

---

## Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | ❌ | Send OTP to email |
| `POST` | `/auth/verify` | ❌ | Verify OTP and receive JWT |

#### `POST /auth/login`
```json
// Request
{ "email": "student@kiit.ac.in" }

// Response 200
{ "message": "OTP sent successfully" }
```

#### `POST /auth/verify`
```json
// Request
{ "email": "student@kiit.ac.in", "otp": "123456" }

// Response 200
{ "token": "eyJhbGci...", "user": { "id": "uuid", "email": "..." } }
```

---

### User
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/user/profile` | ✅ | Get own profile |
| `PUT` | `/user/profile` | ✅ | Update profile fields |
| `POST` | `/user/profile/complete` | ✅ | Complete onboarding (name, college, branch, year) |
| `GET` | `/user/mentors` | ✅ | List approved mentors (cached) |
| `POST` | `/user/mentor-apply` | ✅ | Apply for mentor role |
| `GET` | `/user/:id` | ✅ | Get public profile (includes `isOnline`) |

#### `GET /user/mentors`
Query params: `?search=react&domain=Web Dev`
```json
// Response 200
[
  {
    "id": "uuid",
    "name": "John Doe",
    "college": "KIIT",
    "branch": "CSE",
    "year": 4,
    "interests": ["Web Dev", "AI"],
    "reputation": 12,
    "mentorRate": 0,
    "mentorBio": "Full-stack developer...",
    "isOnline": true
  }
]
```

#### `POST /user/profile/complete`
```json
// Request
{
  "name": "Jane Doe",
  "college": "KIIT University",
  "branch": "CSE",
  "year": 2,
  "interests": ["DSA", "Web Dev"]
}
```

#### `POST /user/mentor-apply`
```json
// Request
{ "mentor_bio": "3 years of experience...", "mentor_rate": 100 }

// Response 200
{ "message": "Mentor application submitted successfully" }
```

---

### Mentorship
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/mentorship/request` | ✅ | Create booking request |
| `POST` | `/mentorship/respond` | ✅ | Accept or reject a request |
| `GET` | `/mentorship/list` | ✅ | List requests (filter by role/status) |

#### `POST /mentorship/request`
```json
// Request
{
  "mentorId": "uuid",
  "topic": "DSA Interview Prep",
  "scheduledAt": "2026-05-01T14:00:00Z"
}
```

#### `POST /mentorship/respond`
```json
// Request
{ "requestId": "uuid", "action": "accepted" }  // or "rejected"
```

#### `GET /mentorship/list`
Query params: `?role=mentor&status=pending`

---

### Session
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/session/create` | ✅ | Create/join a session room |
| `GET` | `/session/:id` | ✅ | Get session details |
| `POST` | `/session/:id/end` | ✅ | End a session |
| `GET` | `/session/history` | ✅ | Get paginated session history |

#### `GET /session/history`
Query params: `?limit=10&offset=0`
```json
// Response 200
[
  {
    "id": "uuid",
    "type": "casual",
    "partnerName": "Jane Doe",
    "partnerId": "uuid",
    "duration": 320,
    "startedAt": "2026-04-20T10:15:00Z",
    "hasRated": false
  }
]
```

---

### Rating
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/rating/submit` | ✅ | Submit a session rating (1-5) |
| `GET` | `/rating/user/:id` | ✅ | Get aggregate ratings for a user |

#### `POST /rating/submit`
```json
// Request
{
  "sessionId": "uuid",
  "ratedId": "uuid",
  "score": 5,
  "comment": "Great mentor, very helpful!"
}
```

#### `GET /rating/user/:id`
```json
// Response 200
{
  "total_ratings": 14,
  "average_score": 4.57,
  "recent_ratings": [
    { "score": 5, "comment": "Excellent session!", "createdAt": "2026-04-20..." }
  ]
}
```

---

### Safety
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/safety/report` | ✅ | Report a user |
| `POST` | `/safety/block` | ✅ | Block a user |
| `DELETE` | `/safety/block/:id` | ✅ | Unblock a user |
| `GET` | `/safety/blocked` | ✅ | List blocked users |

---

### Admin *(requires `ADMIN_EMAILS` in `.env`)*
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/admin/stats` | ✅🔑 | Platform statistics |
| `GET` | `/admin/pending-mentors` | ✅🔑 | List pending mentor applications |
| `POST` | `/admin/mentor-action` | ✅🔑 | Approve or reject mentor |
| `GET` | `/admin/reports` | ✅🔑 | List pending reports |
| `POST` | `/admin/report-action` | ✅🔑 | Resolve or dismiss report |

#### `POST /admin/mentor-action`
```json
{ "userId": "uuid", "action": "approved" }  // or "rejected"
```

---

### Wallet
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/wallet/balance` | ✅ | Get wallet balance |
| `GET` | `/wallet/transactions` | ✅ | List transaction history |
| `POST` | `/wallet/add-funds` | ✅ | Add funds to wallet |

---

## WebSocket Namespaces

### `/match` — Real-time Matchmaking
Requires JWT in `socket.handshake.auth.token`

| Event | Direction | Payload |
|-------|-----------|---------|
| `join_queue` | Client → Server | — |
| `leave_queue` | Client → Server | — |
| `skip` | Client → Server | — |
| `queued` | Server → Client | — |
| `matched` | Server → Client | `{ sessionId, partnerId }` |
| `match_timeout` | Server → Client | `{ message }` |
| `partner_skipped` | Server → Client | `{ message }` |
| `partner_disconnected` | Server → Client | `{ message }` |
| `notification` | Server → Client | `{ type, message }` |

### `/signaling` — WebRTC Relay
| Event | Direction | Payload |
|-------|-----------|---------|
| `join_session` | Client → Server | `{ sessionId }` |
| `offer` | Bidirectional | `{ sessionId, offer }` |
| `answer` | Bidirectional | `{ sessionId, answer }` |
| `ice_candidate` | Bidirectional | `{ sessionId, candidate }` |
| `peer_joined` | Server → Client | `{ userId }` |
| `peer_left` | Server → Client | `{ userId }` |

---

## Error Responses
All errors follow this format:
```json
{
  "error": "Human-readable error message"
}
```

| Status | Meaning |
|--------|---------|
| `400` | Invalid request / validation failure |
| `401` | Missing or invalid JWT |
| `403` | Forbidden (e.g. not an admin) |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate rating) |
| `429` | Rate limited |
| `500` | Internal server error |

## Rate Limits
- **General**: 100 requests / 15 minutes
- **Auth endpoints**: 5 requests / 15 minutes
