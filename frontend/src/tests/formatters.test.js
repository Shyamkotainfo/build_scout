import { describe, it, expect } from 'vitest';
import { formatConfidence, getConfidencePercent } from '../utils/formatters';

describe('formatConfidence', () => {
  it('handles backend returning 0-100 scale integers', () => {
    expect(formatConfidence(72)).toBe('72%');
    expect(formatConfidence(76)).toBe('76%');
    expect(formatConfidence(100)).toBe('100%');
    expect(formatConfidence(0)).toBe('0%');
  });

  it('handles backend returning normalized decimals (0-1 scale)', () => {
    expect(formatConfidence(0.72)).toBe('72%');
    expect(formatConfidence(0.76)).toBe('76%');
    expect(formatConfidence(1)).toBe('100%');
    // Note: 0 is ambiguous but clamped correctly to 0%
    expect(formatConfidence(0.0)).toBe('0%');
  });

  it('handles string percentages', () => {
    expect(formatConfidence('72%')).toBe('72%');
    expect(formatConfidence('100%')).toBe('100%');
  });

  it('does not allow NaN or undefined values', () => {
    expect(formatConfidence(undefined)).toBe('0%');
    expect(formatConfidence(null)).toBe('0%');
    expect(formatConfidence(NaN)).toBe('0%');
    expect(formatConfidence('invalid')).toBe('0%');
  });
});

describe('getConfidencePercent', () => {
  it('returns raw numbers for 0-100 scale inputs', () => {
    expect(getConfidencePercent(72)).toBe(72);
    expect(getConfidencePercent(100)).toBe(100);
  });

  it('returns scaled integers for normalized decimals', () => {
    expect(getConfidencePercent(0.72)).toBe(72);
    expect(getConfidencePercent(1)).toBe(100);
  });

  it('handles edge cases gracefully', () => {
    expect(getConfidencePercent(undefined)).toBe(0);
    expect(getConfidencePercent(NaN)).toBe(0);
    // clamps values over 100 (if they were erroneously provided and assumed 0-100)
    expect(getConfidencePercent(7200)).toBe(100);
  });
});
