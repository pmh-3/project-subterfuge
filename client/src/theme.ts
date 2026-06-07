export const colors = {
  background: '#1A1614', // Deep Espresso / Leather
  surface: '#D4C9B0', // Aged Manila Folder
  primary: '#B58E3D', // Brushed Brass / Gold
  text: '#0F172A', // Midnight Blue-Black Ink (for light surfaces)
  secondary: '#5C4033', // Dark Brown / Old Text
  error: '#8B0000', // Rubber Stamp Red
  border: '#8B5A2B', // Leather stitching / dark brass
  overlay: 'rgba(26, 22, 20, 0.95)',
  paper: '#F0E6D2', // Lighter paper for inner documents
  paperWarm: '#EAE0C8', // Warm manila for photo boxes / accents
  success: '#2E7D32',

  // Semi-transparent variants used across multiple components
  surfaceFaint: 'rgba(212, 201, 176, 0.05)',
  surfaceTint: 'rgba(234, 224, 200, 0.15)',
  surfaceMuted: 'rgba(234, 224, 200, 0.6)',
  surfaceLight: 'rgba(234, 224, 200, 0.8)',
  alertBackground: '#220000',
  primaryFaint: 'rgba(181, 142, 61, 0.15)',
  successFaint: 'rgba(46, 125, 50, 0.2)',
  errorFaint: 'rgba(139, 0, 0, 0.15)',
  holdOverlay: 'rgba(0, 0, 0, 0.3)',
  statsBackground: 'rgba(0, 0, 0, 0.4)',
  darkOverlay: 'rgba(0, 0, 0, 0.85)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 60,
};

export const typography = {
  fontFamily: {
    serif: 'PlayfairDisplay_700Bold', // Headers
    mono: 'SpecialElite_400Regular', // Typewriter
    sans: 'Inter_600SemiBold', // Labels
  },
  fontSize: {
    xs2: 10,
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 22,
    xl: 26,
    title: 30,
    xxl: 38,
    jumbo: 50,
  },
  letterSpacing: {
    tight: 0.5,
    normal: 1,
    wide: 2,
  },
  lineHeight: {
    sm: 18,
    md: 24,
    lg: 32,
  },
};

export const theme = {
  colors,
  spacing,
  typography,
};
