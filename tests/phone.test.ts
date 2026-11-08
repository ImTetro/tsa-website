import { describe, expect, test } from 'vitest';
import { isIsraeliPhone } from '../src/lib/phone';

describe('isIsraeliPhone', () => {
  test.each(['052-1234567', '0521234567', '09-8820022', '098820022', '+972 52 123 4567', '972521234567', '077-1234567', '02 123 4567'])('accepts %s', (v) => {
    expect(isIsraeliPhone(v)).toBe(true);
  });
  test.each(['', '12', '052-12345', '1234567890', '+1 555 123 4567', '06-1234567', 'abc'])('rejects %s', (v) => {
    expect(isIsraeliPhone(v)).toBe(false);
  });
});
