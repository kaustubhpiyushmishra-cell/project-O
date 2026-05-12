const { z } = require('zod');

// ─── Auth ─────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
});

const verifySchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
  otp: z
    .string({ required_error: 'OTP is required' })
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

// ─── User ─────────────────────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  college: z.string().min(2).max(200).trim().optional(),
  branch: z.string().min(2).max(100).trim().optional(),
  year: z.number().int().min(1).max(6).optional(),
  interests: z.array(z.string().trim().max(50)).max(20).optional(),
});

const completeProfileSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  college: z.string().min(2).max(200).trim(),
  branch: z.string().min(2).max(100).trim().optional(),
  year: z.number().int().min(1).max(6).optional(),
  interests: z.array(z.string().trim().max(50)).max(20).optional(),
});

const mentorApplySchema = z.object({
  mentor_bio: z.string().min(10, 'Bio must be at least 10 characters').trim(),
  mentor_rate: z.number().int().min(0, 'Rate cannot be negative'),
});

const listMentorsSchema = z.object({
  search: z.string().trim().optional(),
  domain: z.string().trim().optional(),
});

// ─── Match ────────────────────────────────────────────
const nextMatchSchema = z.object({
  sessionId: z.string().uuid().optional(),
});

// ─── Session ──────────────────────────────────────────
const createSessionSchema = z.object({
  userId2: z.string().uuid('Invalid user ID'),
  type: z.enum(['casual', 'mentorship']),
  mentorshipId: z.string().uuid().optional(),
});

// ─── Mentorship ───────────────────────────────────────
const createMentorshipSchema = z.object({
  mentorId: z.string().uuid('Invalid mentor ID'),
  message: z.string().max(1000).trim().optional(),
  topic: z.string().max(200).trim().optional(),
});

const respondMentorshipSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  action: z.enum(['accepted', 'rejected']),
  scheduledAt: z.string().datetime().optional(),
});

// ─── Rating ───────────────────────────────────────────
const submitRatingSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  ratedId: z.string().uuid('Invalid user ID'),
  score: z.number().int().min(1).max(5),
  comment: z.string().max(500).trim().optional(),
});

// ─── Safety ───────────────────────────────────────────
const reportUserSchema = z.object({
  reportedId: z.string().uuid('Invalid user ID'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(1000).trim(),
  sessionId: z.string().uuid().optional(),
});

const blockUserSchema = z.object({
  blockedId: z.string().uuid('Invalid user ID'),
});

module.exports = {
  loginSchema,
  verifySchema,
  updateProfileSchema,
  completeProfileSchema,
  mentorApplySchema,
  listMentorsSchema,
  nextMatchSchema,
  createSessionSchema,
  createMentorshipSchema,
  respondMentorshipSchema,
  submitRatingSchema,
  reportUserSchema,
  blockUserSchema,
};
