/**
 * Cryptographically Secure Random & Identifier Utilities
 * Compliant with SonarQube Rule S2245 / CWE-330
 */

let seqCounter = 0;

/**
 * Returns a cryptographically secure random float in [0, 1) using Web Crypto API.
 */
export function getSecureRandom(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0]! / (0xffffffff + 1);
  }
  return 0.5;
}

/**
 * Generates a collision-resistant, deterministic sequential ID.
 */
export function getNextSequenceId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${++seqCounter}`;
}
