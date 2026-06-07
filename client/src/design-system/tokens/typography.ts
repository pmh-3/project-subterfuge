import { Platform, TextStyle } from 'react-native';

/** RN letterSpacing is absolute px — convert from em at token definition time */
export function tracking(fontSize: number, em: number): number {
  return fontSize * em;
}

/** Special Elite renders too thin on Android at 7–8px */
export function typewriterSize(size: number): number {
  return Platform.select({ android: Math.max(size, 9), default: size }) ?? size;
}

export const fontFamily = {
  serif: 'CormorantGaramond_600SemiBold',
  serifMedium: 'CormorantGaramond_500Medium',
  serifRegular: 'CormorantGaramond_400Regular',
  sans: 'Outfit_400Regular',
  sansLight: 'Outfit_300Light',
  sansMedium: 'Outfit_500Medium',
  sansSemibold: 'Outfit_600SemiBold',
  typewriter: 'SpecialElite_400Regular',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export type TextVariant =
  | 'displayHero'
  | 'displayLarge'
  | 'display'
  | 'title'
  | 'codeHero'
  | 'codeLarge'
  | 'codeMedium'
  | 'codeSmall'
  | 'codeMicro'
  | 'bodyInput'
  | 'body'
  | 'bodySmall'
  | 'buttonLarge'
  | 'buttonSmall'
  | 'buttonGhost'
  | 'label'
  | 'labelLarge'
  | 'labelMicro'
  | 'metaMicro';

type VariantStyle = Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'fontWeight' | 'letterSpacing' | 'lineHeight' | 'textTransform'
>;

const labelBase = (size: number, em: number): VariantStyle => ({
  fontFamily: fontFamily.typewriter,
  fontSize: typewriterSize(size),
  fontWeight: '400',
  letterSpacing: tracking(typewriterSize(size), em),
  textTransform: 'uppercase',
});

export const textVariants: Record<TextVariant, VariantStyle> = {
  displayHero: {
    fontFamily: fontFamily.serif,
    fontSize: 46,
    fontWeight: '600',
    letterSpacing: tracking(46, -0.01),
    lineHeight: 46 * 0.95,
  },
  displayLarge: {
    fontFamily: fontFamily.serif,
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: tracking(32, 0.01),
    lineHeight: 32,
  },
  display: {
    fontFamily: fontFamily.serifMedium,
    fontSize: 28,
    fontWeight: '500',
    lineHeight: 28 * 1.2,
  },
  title: {
    fontFamily: fontFamily.serifMedium,
    fontSize: 26,
    fontWeight: '500',
  },
  codeHero: {
    fontFamily: fontFamily.mono,
    fontSize: 64,
    fontWeight: '400',
    letterSpacing: tracking(64, 0.12),
    lineHeight: 64,
  },
  codeLarge: {
    fontFamily: fontFamily.mono,
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: tracking(20, 0.18),
  },
  codeMedium: {
    fontFamily: fontFamily.mono,
    fontSize: 18,
    fontWeight: '400',
  },
  codeSmall: {
    fontFamily: fontFamily.mono,
    fontSize: 13,
    fontWeight: '400',
  },
  codeMicro: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    fontWeight: '400',
  },
  bodyInput: {
    fontFamily: fontFamily.sansLight,
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: tracking(18, 0.02),
  },
  body: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 14 * 1.6,
  },
  bodySmall: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 12 * 1.7,
  },
  buttonLarge: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: tracking(12, 0.1),
    textTransform: 'uppercase',
  },
  buttonSmall: {
    fontFamily: fontFamily.sansSemibold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: tracking(11, 0.1),
    textTransform: 'uppercase',
  },
  buttonGhost: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: tracking(12, 0.08),
    textTransform: 'uppercase',
  },
  label: labelBase(8, 0.22),
  labelLarge: labelBase(8, 0.28),
  labelMicro: labelBase(7, 0.12),
  metaMicro: {
    fontFamily: fontFamily.typewriter,
    fontSize: typewriterSize(10),
    fontWeight: '400',
    letterSpacing: tracking(typewriterSize(10), 0.2),
    textTransform: 'uppercase',
  },
};

export function getTextVariantStyle(variant: TextVariant): VariantStyle {
  return textVariants[variant];
}
