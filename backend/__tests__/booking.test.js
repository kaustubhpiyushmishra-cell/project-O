/**
 * Unit tests for mentorship booking validation logic —
 * request creation, response actions, and duplicate prevention.
 */

describe('Mentorship booking validation', () => {
  // Request creation validation
  function validateBookingRequest({ mentorId, topic, requesterId }) {
    const errors = [];

    if (!mentorId) errors.push('mentorId is required');
    if (!requesterId) errors.push('requesterId is required');

    if (mentorId && requesterId && mentorId === requesterId) {
      errors.push('Cannot book yourself as a mentor');
    }

    if (topic && topic.length > 200) {
      errors.push('Topic must be 200 characters or fewer');
    }

    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  }

  describe('request creation', () => {
    test('accepts valid booking request', () => {
      const result = validateBookingRequest({
        mentorId: 'mentor1',
        requesterId: 'student1',
        topic: 'DSA Interview Prep',
      });
      expect(result.valid).toBe(true);
    });

    test('requires mentorId', () => {
      const result = validateBookingRequest({
        mentorId: '',
        requesterId: 'student1',
        topic: 'Help',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('mentorId is required');
    });

    test('requires requesterId', () => {
      const result = validateBookingRequest({
        mentorId: 'mentor1',
        requesterId: '',
        topic: 'Help',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('requesterId is required');
    });

    test('prevents self-booking', () => {
      const result = validateBookingRequest({
        mentorId: 'user1',
        requesterId: 'user1',
        topic: 'Help',
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cannot book yourself as a mentor');
    });

    test('rejects excessively long topics', () => {
      const result = validateBookingRequest({
        mentorId: 'mentor1',
        requesterId: 'student1',
        topic: 'A'.repeat(201),
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Topic must be 200 characters or fewer');
    });

    test('allows empty topic (optional field)', () => {
      const result = validateBookingRequest({
        mentorId: 'mentor1',
        requesterId: 'student1',
        topic: undefined,
      });
      expect(result.valid).toBe(true);
    });
  });

  // Response action validation
  describe('response actions', () => {
    const VALID_ACTIONS = ['accepted', 'rejected'];

    function validateResponseAction(action) {
      if (!action) return { valid: false, error: 'Action is required' };
      if (!VALID_ACTIONS.includes(action)) {
        return { valid: false, error: `Invalid action. Must be one of: ${VALID_ACTIONS.join(', ')}` };
      }
      return { valid: true };
    }

    test('accepts "accepted" action', () => {
      expect(validateResponseAction('accepted').valid).toBe(true);
    });

    test('accepts "rejected" action', () => {
      expect(validateResponseAction('rejected').valid).toBe(true);
    });

    test('rejects invalid actions', () => {
      expect(validateResponseAction('pending').valid).toBe(false);
      expect(validateResponseAction('cancelled').valid).toBe(false);
      expect(validateResponseAction('completed').valid).toBe(false);
    });

    test('rejects empty action', () => {
      expect(validateResponseAction('').valid).toBe(false);
      expect(validateResponseAction(undefined).valid).toBe(false);
    });
  });

  // Duplicate prevention logic
  describe('duplicate prevention', () => {
    function isDuplicateBooking(existingRequests, newRequest) {
      return existingRequests.some(
        (req) =>
          req.mentorId === newRequest.mentorId &&
          req.requesterId === newRequest.requesterId &&
          req.status === 'pending'
      );
    }

    test('detects duplicate pending request', () => {
      const existing = [
        { mentorId: 'mentor1', requesterId: 'student1', status: 'pending' },
      ];
      const newReq = { mentorId: 'mentor1', requesterId: 'student1' };
      expect(isDuplicateBooking(existing, newReq)).toBe(true);
    });

    test('allows rebooking after rejection', () => {
      const existing = [
        { mentorId: 'mentor1', requesterId: 'student1', status: 'rejected' },
      ];
      const newReq = { mentorId: 'mentor1', requesterId: 'student1' };
      expect(isDuplicateBooking(existing, newReq)).toBe(false);
    });

    test('allows booking a different mentor', () => {
      const existing = [
        { mentorId: 'mentor1', requesterId: 'student1', status: 'pending' },
      ];
      const newReq = { mentorId: 'mentor2', requesterId: 'student1' };
      expect(isDuplicateBooking(existing, newReq)).toBe(false);
    });

    test('handles no existing requests', () => {
      expect(isDuplicateBooking([], { mentorId: 'mentor1', requesterId: 'student1' })).toBe(false);
    });
  });
});
