/**
 * Unit tests for rating validation logic — score bounds,
 * self-rating prevention, and submission constraints.
 */

describe('Rating validation', () => {
  function validateRating({ sessionId, ratedId, score, raterId }) {
    const errors = [];

    if (!sessionId) errors.push('sessionId is required');
    if (!ratedId) errors.push('ratedId is required');
    if (!score) errors.push('score is required');

    if (score && (score < 1 || score > 5)) {
      errors.push('Score must be between 1 and 5');
    }

    if (ratedId && raterId && ratedId === raterId) {
      errors.push('Cannot rate yourself');
    }

    return errors.length > 0 ? { valid: false, errors } : { valid: true };
  }

  test('accepts valid rating (1-5)', () => {
    const base = { sessionId: 'sess1', ratedId: 'user2', raterId: 'user1' };
    expect(validateRating({ ...base, score: 1 }).valid).toBe(true);
    expect(validateRating({ ...base, score: 3 }).valid).toBe(true);
    expect(validateRating({ ...base, score: 5 }).valid).toBe(true);
  });

  test('rejects score out of bounds', () => {
    const base = { sessionId: 'sess1', ratedId: 'user2', raterId: 'user1' };
    expect(validateRating({ ...base, score: 0 }).valid).toBe(false);
    expect(validateRating({ ...base, score: 6 }).valid).toBe(false);
    expect(validateRating({ ...base, score: -1 }).valid).toBe(false);
  });

  test('rejects self-rating', () => {
    const result = validateRating({
      sessionId: 'sess1', ratedId: 'user1', raterId: 'user1', score: 5
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Cannot rate yourself');
  });

  test('requires sessionId', () => {
    const result = validateRating({
      sessionId: '', ratedId: 'user2', raterId: 'user1', score: 4
    });
    expect(result.valid).toBe(false);
  });

  test('requires ratedId', () => {
    const result = validateRating({
      sessionId: 'sess1', ratedId: '', raterId: 'user1', score: 4
    });
    expect(result.valid).toBe(false);
  });

  // Reputation logic: scores >= 4 should grant +1 reputation
  describe('reputation bonus', () => {
    function shouldGrantReputation(score) {
      return score >= 4;
    }

    test('grants reputation for scores 4 and 5', () => {
      expect(shouldGrantReputation(4)).toBe(true);
      expect(shouldGrantReputation(5)).toBe(true);
    });

    test('does not grant reputation for scores below 4', () => {
      expect(shouldGrantReputation(1)).toBe(false);
      expect(shouldGrantReputation(2)).toBe(false);
      expect(shouldGrantReputation(3)).toBe(false);
    });
  });
});
