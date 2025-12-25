import { TextStyle } from 'react-native';

type ColorTokens = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  primary: string;
  primarySoft: string;
  text: string;
  muted: string;
  subdued: string;
  inverseText: string;
  success: string;
  warning: string;
  info: string;
  overlay: string;
  input: string;
};

type SpacingScale = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
};

type RadiusScale = {
  sm: number;
  md: number;
  lg: number;
  pill: number;
};

type TypographyScale = {
  title: TextStyle;
  heading: TextStyle;
  subtitle: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  label: TextStyle;
};

export type Theme = {
  colors: ColorTokens;
  spacing: SpacingScale;
  radius: RadiusScale;
  typography: TypographyScale;
};

const spacing: SpacingScale = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const radius: RadiusScale = {
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
};

const typography: TypographyScale = {
  title: { fontSize: 24, fontWeight: '800', lineHeight: 32 },
  heading: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
  subtitle: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
};

const lightColors: ColorTokens = {
  background: '#f8f9fb',
  surface: '#ffffff',
  surfaceMuted: '#f2f4f8',
  border: '#e5e7eb',
  primary: '#f7c948',
  primarySoft: '#fff4cc',
  text: '#0b0b0f',
  muted: '#4b5563',
  subdued: '#6b7280',
  inverseText: '#0b0b0f',
  success: '#10b981',
  warning: '#f59e0b',
  info: '#2563eb',
  overlay: 'rgba(0,0,0,0.06)',
  input: '#eef1f6',
};

const darkColors: ColorTokens = {
  background: '#0b0b0f',
  surface: '#14141c',
  surfaceMuted: '#1b1b26',
  border: '#262637',
  primary: '#f7c948',
  primarySoft: '#3b320f',
  text: '#f5f5f5',
  muted: '#c5cad3',
  subdued: '#9aa0aa',
  inverseText: '#0b0b0f',
  success: '#34d399',
  warning: '#f59e0b',
  info: '#60a5fa',
  overlay: 'rgba(255,255,255,0.04)',
  input: '#0f0f17',
};

export const themes: Record<'light' | 'dark', Theme> = {
  light: { colors: lightColors, spacing, radius, typography },
  dark: { colors: darkColors, spacing, radius, typography },
};
