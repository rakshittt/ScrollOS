export const colors = {
  // Primary colors
  primary: {
    50: '#F7F7F7',
    100: '#E1E1E1',
    200: '#CFCFCF',
    300: '#B1B1B1',
    400: '#9E9E9E',
    500: '#7E7E7E',
    600: '#626262',
    700: '#515151',
    800: '#3B3B3B',
    900: '#222222',
  },
  // Accent colors
  accent: {
    red: '#FF385C',
    pink: '#FF5A5F',
    orange: '#FF8A00',
    yellow: '#FFB400',
    green: '#00A699',
    blue: '#007A87',
    purple: '#7B0051',
  },
  // Semantic colors
  semantic: {
    success: '#00A699',
    warning: '#FFB400',
    error: '#FF5A5F',
    info: '#007A87',
  },
  // Background colors
  background: {
    light: '#FFFFFF',
    dark: '#222222',
    gray: '#F7F7F7',
  },
  // Text colors
  text: {
    primary: '#222222',
    secondary: '#717171',
    tertiary: '#717171',
    disabled: '#B1B1B1',
    inverse: '#FFFFFF',
  },
  // Border colors
  border: {
    light: '#E1E1E1',
    medium: '#CFCFCF',
    dark: '#B1B1B1',
  },
};

export const typography = {
  fontFamily: {
    sans: 'Circular, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif',
    mono: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',
};

export const transitions = {
  DEFAULT: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  fast: '100ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
}; 