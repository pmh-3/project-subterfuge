import { generateGameCode } from '@/utils/gameUtils';

describe('generateGameCode', () => {
  it('returns a 4-character string', () => {
    const code = generateGameCode();
    expect(code).toHaveLength(4);
  });

  it('contains only uppercase letters', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateGameCode();
      expect(code).toMatch(/^[A-Z]{4}$/);
    }
  });

  it('generates different codes across calls (probabilistic)', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateGameCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});
