/**
 * BuildScout Design System — Typography Tokens
 */

export const fontFamily = {
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
};

export const fontSize = {
  xs:   '0.75rem',   // 12px
  sm:   '0.875rem',  // 14px
  base: '1rem',      // 16px
  lg:   '1.125rem',  // 18px
  xl:   '1.25rem',   // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
};

export const fontWeight = {
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,
};

export const lineHeight = {
  tight:  1.25,
  snug:   1.375,
  normal: 1.5,
  relaxed: 1.625,
};

export const letterSpacing = {
  tight:  '-0.025em',
  normal: '0',
  wide:   '0.025em',
  wider:  '0.05em',
  widest: '0.1em',
};

export default { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing };
