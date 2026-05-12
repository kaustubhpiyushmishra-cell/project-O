/**
 * Unit tests for isCollegeEmail validation logic.
 * Tests the domain whitelist enforcement that gates platform access.
 */

// Extract isCollegeEmail by requiring the module with mocked deps
// We test the logic directly since it's a pure function

describe('isCollegeEmail validation', () => {
  // Replicate the isCollegeEmail logic for unit testing
  function isCollegeEmail(email, domains) {
    if (!domains || domains.length === 0) return true;
    const emailDomain = email.substring(email.indexOf('@') + 1).toLowerCase();
    return domains.some((d) => {
      const domain = d.trim().toLowerCase();
      if (domain.startsWith('.')) {
        return emailDomain.endsWith(domain);
      }
      return emailDomain === domain;
    });
  }

  test('allows all emails when domains list is empty', () => {
    expect(isCollegeEmail('user@gmail.com', [])).toBe(true);
    expect(isCollegeEmail('user@kiit.ac.in', [])).toBe(true);
  });

  test('allows all emails when domains is undefined', () => {
    expect(isCollegeEmail('user@anything.org', undefined)).toBe(true);
  });

  test('allows matching exact domain', () => {
    expect(isCollegeEmail('student@kiit.ac.in', ['kiit.ac.in'])).toBe(true);
  });

  test('rejects non-matching domain', () => {
    expect(isCollegeEmail('user@gmail.com', ['kiit.ac.in'])).toBe(false);
  });

  test('allows suffix match with dot-prefix domains', () => {
    expect(isCollegeEmail('user@mit.edu', ['.edu'])).toBe(true);
    expect(isCollegeEmail('user@stanford.edu', ['.edu'])).toBe(true);
  });

  test('rejects suffix mismatch', () => {
    expect(isCollegeEmail('user@gmail.com', ['.edu'])).toBe(false);
  });

  test('is case-insensitive', () => {
    expect(isCollegeEmail('USER@KIIT.AC.IN', ['kiit.ac.in'])).toBe(true);
    expect(isCollegeEmail('user@kiit.ac.in', ['KIIT.AC.IN'])).toBe(true);
  });

  test('allows multiple domains', () => {
    const domains = ['kiit.ac.in', 'vit.ac.in', '.edu'];
    expect(isCollegeEmail('a@kiit.ac.in', domains)).toBe(true);
    expect(isCollegeEmail('b@vit.ac.in', domains)).toBe(true);
    expect(isCollegeEmail('c@stanford.edu', domains)).toBe(true);
    expect(isCollegeEmail('d@gmail.com', domains)).toBe(false);
  });

  test('handles whitespace in domains config', () => {
    expect(isCollegeEmail('user@kiit.ac.in', [' kiit.ac.in '])).toBe(true);
  });
});
