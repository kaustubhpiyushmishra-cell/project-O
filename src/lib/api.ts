import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 globally → auto-logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const authApi = {
  login: (email: string) =>
    api.post('/auth/login', { email }),

  verify: (email: string, otp: string) =>
    api.post<{ token: string; user: User }>('/auth/verify', { email, otp }),
};

// ─── User ────────────────────────────────────────────────
export const userApi = {
  getProfile: () =>
    api.get<User>('/user/profile'),

  updateProfile: (data: Partial<UserUpdate>) =>
    api.put<User>('/user/profile', data),

  completeProfile: (data: UserUpdate) =>
    api.post<User>('/user/profile/complete', data),

  listMentors: (params?: { search?: string; domain?: string }) =>
    api.get<User[]>('/user/mentors', { params }),

  applyForMentor: (data: { mentor_bio: string; mentor_rate: number }) =>
    api.post<{ message: string }>('/user/mentor-apply', data),

  getPublicProfile: (id: string) =>
    api.get<User>(`/user/${id}`),
};

// ─── Matching ────────────────────────────────────────────
export const matchApi = {
  join: () =>
    api.post<MatchResult>('/match/join'),

  leave: () =>
    api.post('/match/leave'),

  next: (sessionId?: string) =>
    api.post<MatchResult>('/match/next', { sessionId }),
};

// ─── Mentorship ──────────────────────────────────────────
export const mentorshipApi = {
  createRequest: (data: { mentorId: string; message?: string; topic?: string }) =>
    api.post('/mentorship/request', data),

  respond: (data: { requestId: string; action: 'accepted' | 'rejected'; scheduledAt?: string }) =>
    api.post('/mentorship/respond', data),

  list: (params?: { role?: 'mentor' | 'requester'; status?: string }) =>
    api.get('/mentorship/list', { params }),
};

// ─── Session ─────────────────────────────────────────────
export const sessionApi = {
  create: (data: { userId2: string; type: 'casual' | 'mentorship'; mentorshipId?: string }) =>
    api.post('/session/create', data),

  get: (id: string) =>
    api.get(`/session/${id}`),

  end: (id: string) =>
    api.post(`/session/${id}/end`),

  history: (params?: { limit?: number; offset?: number }) =>
    api.get<SessionHistory[]>('/session/history', { params }),
};

// ─── Rating ──────────────────────────────────────────────
export const ratingApi = {
  submit: (data: { sessionId: string; ratedId: string; score: number; comment?: string }) =>
    api.post('/rating/submit', data),

  getUserRatings: (userId: string) =>
    api.get<RatingStats>(`/rating/user/${userId}`),
};

// ─── Safety ──────────────────────────────────────────────
export const safetyApi = {
  report: (data: { reportedId: string; reason: string; sessionId?: string }) =>
    api.post('/safety/report', data),

  block: (blockedId: string) =>
    api.post('/safety/block', { blockedId }),

  unblock: (id: string) =>
    api.delete(`/safety/block/${id}`),

  listBlocked: () =>
    api.get('/safety/blocked'),
};

// ─── Admin ───────────────────────────────────────────────
export const adminApi = {
  getStats: () =>
    api.get<AdminStats>('/admin/stats'),

  getPendingMentors: () =>
    api.get<PendingMentor[]>('/admin/pending-mentors'),

  mentorAction: (data: { userId: string; action: 'approved' | 'rejected' }) =>
    api.post('/admin/mentor-action', data),

  getReports: () =>
    api.get<AdminReport[]>('/admin/reports'),

  reportAction: (data: { reportId: string; action: 'resolved' | 'dismissed' }) =>
    api.post('/admin/report-action', data),
};

// ─── Wallet ──────────────────────────────────────────────
export const walletApi = {
  getBalance: () =>
    api.get<{ balance: number }>('/wallet/balance'),

  getTransactions: (params?: { limit?: number; offset?: number }) =>
    api.get<{ transactions: Transaction[]; total: number }>('/wallet/transactions', { params }),

  addFunds: (amount: number) =>
    api.post<{ message: string; balance: number }>('/wallet/add', { amount }),
};

// ─── Types ───────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string | null;
  college: string | null;
  branch: string | null;
  year: number | null;
  interests: string[] | null;
  reputation: number;
  isVerified: boolean;
  isMentor?: boolean;
  mentorStatus?: 'pending' | 'approved' | 'rejected' | null;
  mentorRate?: number;
  mentorBio?: string | null;
  needsOnboarding?: boolean;
  walletBalance?: number;
  isOnline?: boolean;
  createdAt?: string;
}

export interface UserUpdate {
  name: string;
  college: string;
  branch: string;
  year: number;
  interests: string[];
}

export interface MatchResult {
  status: 'matched' | 'queued' | 'already_in_queue' | 'left';
  sessionId?: string;
  partnerId?: string;
}

export interface AdminStats {
  pendingMentors: number;
  pendingReports: number;
  activeSessions: number;
  totalUsers: number;
}

export interface PendingMentor {
  id: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  year: number;
  mentorBio: string;
  mentorRate: number;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  reason: string;
  status: string;
  sessionId?: string;
  reporterName: string;
  reporterEmail: string;
  reportedName: string;
  reportedEmail: string;
  reportedId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  refId?: string;
  createdAt: string;
}

export interface SessionHistory {
  id: string;
  type: 'casual' | 'mentorship';
  status: 'active' | 'ended' | 'missed';
  startedAt: string;
  endedAt?: string;
  durationSec?: number;
  partnerId: string;
  partnerName: string;
  partnerCollege: string;
  myRating?: number;
  receivedRating?: number;
}

export interface RatingStats {
  total_ratings: number;
  average_score: number;
  recent_ratings: Review[];
}

export interface Review {
  score: number;
  comment: string | null;
  createdAt: string;
}

export default api;
