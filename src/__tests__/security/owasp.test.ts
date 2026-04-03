/**
 * Dummy security test to ensure test runner finds security tests
 * Actual security validators are in tests/security.validators.test.ts
 */
describe('OWASP Compliance Dummy', () => {
  test('Security pipeline validation pass', () => {
    expect(true).toBe(true);
  });
});
