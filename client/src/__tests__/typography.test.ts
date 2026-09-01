import { Platform } from 'react-native';
import { tracking, typewriterSize, textVariants } from '@/design-system/tokens/typography';

describe('typography tokens', () => {
  it('converts em tracking to absolute pixels', () => {
    expect(tracking(12, 0.1)).toBeCloseTo(1.2);
    expect(tracking(46, -0.01)).toBeCloseTo(-0.46);
  });

  it('bumps typewriter sizes on Android', () => {
    const originalSelect = Platform.select;
    Platform.select = ((spec: Record<string, number>) => spec.android) as typeof Platform.select;
    expect(typewriterSize(7)).toBe(10);
    expect(typewriterSize(12)).toBe(12);
    Platform.select = originalSelect;
  });

  it('uppercases label variants', () => {
    expect(textVariants.label.textTransform).toBe('uppercase');
    expect(textVariants.labelMicro.textTransform).toBe('uppercase');
  });
});
