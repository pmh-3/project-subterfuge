/** Midnight Wire color tokens — canonical palette per DESIGN_SYSTEM.md §2 */
export const colors = {
  background: '#F6F2E8',
  surface: '#EEEADC',
  surfaceHover: '#EEEADC',
  inkPrimary: '#1C1408',
  inkSecondary: '#5A4E30',
  inkMuted: '#6B6048',
  inkOnDark: '#FDFBF6',
  accent: '#2A3A18',
  accentHover: '#3A4F24',
  accentTint: 'rgba(42,58,24,0.08)',
  accentText: '#3A6A2A',
  success: '#2A5A1A',
  successSurface: 'rgba(40,90,30,0.10)',
  successBorder: 'rgba(40,90,30,0.30)',
  danger: '#6E1C1C',
  dangerHover: '#8A2424',
  border: 'rgba(28,20,8,0.14)',
  borderStrong: 'rgba(28,20,8,0.26)',
  placeholder: 'rgba(28,20,8,0.30)',
} as const;

export type ColorToken = keyof typeof colors;
