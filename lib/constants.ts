import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const WINDOW_WIDTH = width;
export const WINDOW_HEIGHT = height;

export const COLORS = {
  // Premium harmony palette
  primary: '#0F0F0F',      // Modern deep black/charcoal
  secondary: '#707070',    // Muted dark gray
  accent: '#6366F1',       // Sleek cobalt/indigo for main buttons, focus states, etc.
  accentLight: '#EEF2FF',  // Very light indigo for badges and highlights
  
  background: '#F9FAFB',   // Premium off-white/light-gray background
  card: '#FFFFFF',         // Pure white for cards and modules
  text: '#111827',         // Very dark charcoal for readable body text
  textMuted: '#6B7280',    // Medium gray for descriptions and sub-labels
  border: '#E5E7EB',       // Light hairline divider color
  
  // Status Colors
  success: '#10B981',      // Vibrant emerald green
  error: '#EF4444',        // Soft premium red
  warning: '#F59E0B',      // Amber yellow
  info: '#3B82F6',         // Ocean blue
  
  // Rating Colors
  star: '#FBBF24',
  
  // Gradient Sets
  primaryGradient: ['#1F2937', '#111827'] as const,
  accentGradient: ['#818CF8', '#6366F1'] as const,
  successGradient: ['#34D399', '#10B981'] as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
};

export const SHADOWS = {
  light: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heavy: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
};
