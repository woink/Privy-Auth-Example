import { describe, expect, it } from 'vitest'; // or jest
import { truncateBalance } from '../balance.ts';

describe('truncateBalance', () => {
  it('should handle floating point noise', () => {
    expect(truncateBalance('0.05000000004872')).toBe('0.05');
  });

  it('should preserve precision for very small numbers', () => {
    expect(truncateBalance('0.00000060004872')).toBe('0.00000060');
  });

  it('should handle whole numbers', () => {
    expect(truncateBalance('1.00000000000000')).toBe('1');
  });

  it('should handle zero', () => {
    expect(truncateBalance('0.00000000000000')).toBe('0');
  });
});
