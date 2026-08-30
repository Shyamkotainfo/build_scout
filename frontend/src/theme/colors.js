/**
 * BuildScout Design System — Color Tokens
 *
 * Primary distribution: 60% light / 30% navy / 10% orange
 * Semantic status colors for decision outcomes and system states.
 */

// ── 60% — Light backgrounds ────────────────────────────────────────────────
export const light = {
  50:  '#ffffff',
  100: '#f8fafc',
  200: '#f1f5f9',
  300: '#e2e8f0',
  400: '#cbd5e1',
  500: '#94a3b8',
};

// ── 30% — Navy structural ──────────────────────────────────────────────────
export const navy = {
  900: '#0f172a',
  800: '#1e293b',
  700: '#334155',
  600: '#475569',
  500: '#64748b',
};

// ── 10% — Safety orange / amber accent ─────────────────────────────────────
export const orange = {
  50:  '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',
  600: '#ea580c',
  700: '#c2410c',
};

// ── Semantic status ────────────────────────────────────────────────────────
export const status = {
  // REUSE, PASS, COMPLETED, CONNECTED
  success:  '#16a34a',
  successLight: '#f0fdf4',
  successBorder: '#bbf7d0',

  // ADAPT, WARNING, PENDING
  warning:  '#d97706',
  warningLight: '#fffbeb',
  warningBorder: '#fde68a',

  // CRITICAL, FAILED, UNAVAILABLE
  critical: '#dc2626',
  criticalLight: '#fef2f2',
  criticalBorder: '#fecaca',

  // RUNNING
  running:  '#2563eb',
  runningLight: '#eff6ff',
  runningBorder: '#bfdbfe',

  // BUILD (navy)
  build:    '#1e293b',
  buildLight: '#f1f5f9',
  buildBorder: '#cbd5e1',

  // PENDING (neutral)
  pending:  '#6b7280',
  pendingLight: '#f9fafb',
  pendingBorder: '#e5e7eb',
};

// ── Mapping: status name → color triplet ───────────────────────────────────
export const statusMap = {
  reuse:       { bg: status.successLight,  text: status.success,  border: status.successBorder,  dot: status.success  },
  pass:        { bg: status.successLight,  text: status.success,  border: status.successBorder,  dot: status.success  },
  completed:   { bg: status.successLight,  text: status.success,  border: status.successBorder,  dot: status.success  },
  connected:   { bg: status.successLight,  text: status.success,  border: status.successBorder,  dot: status.success  },

  adapt:       { bg: status.warningLight,  text: status.warning,  border: status.warningBorder,  dot: status.warning  },
  warning:     { bg: status.warningLight,  text: status.warning,  border: status.warningBorder,  dot: status.warning  },

  build:       { bg: status.buildLight,    text: status.build,    border: status.buildBorder,    dot: status.build    },

  critical:    { bg: status.criticalLight, text: status.critical, border: status.criticalBorder, dot: status.critical },
  failed:      { bg: status.criticalLight, text: status.critical, border: status.criticalBorder, dot: status.critical },
  unavailable: { bg: status.criticalLight, text: status.critical, border: status.criticalBorder, dot: status.critical },

  running:     { bg: status.runningLight,  text: status.running,  border: status.runningBorder,  dot: status.running  },
  pending:     { bg: status.pendingLight,  text: status.pending,  border: status.pendingBorder,  dot: status.pending  },
};

export default { light, navy, orange, status, statusMap };
