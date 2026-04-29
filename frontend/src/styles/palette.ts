/**
 * Design tokens — Mistral light mode palette
 * Single source of truth for all colors in the frontend.
 * Use these tokens in components instead of raw hex values.
 */

export const palette = {
  // ─── Backgrounds ──────────────────────────────────────────
  bg: {
    base:      '#FFFFFF',   // page background
    subtle:    '#F7F7F8',   // sidebar, secondary panels
    muted:     '#EFEFEF',   // hover states on surfaces
    overlay:   '#E8E8EA',   // dividers, cards on subtle bg
  },

  // ─── Borders ──────────────────────────────────────────────
  border: {
    default:   '#E5E5E7',   // standard border
    strong:    '#CACAD0',   // focused / active border
    subtle:    '#F0F0F2',   // very light separator
  },

  // ─── Text ─────────────────────────────────────────────────
  text: {
    primary:   '#0D0D0D',   // headings, main content
    secondary: '#666677',   // labels, metadata
    muted:     '#9B9BA8',   // placeholder, disabled
    inverted:  '#FFFFFF',   // text on dark surfaces
  },

  // ─── Accent (Mistral orange) ───────────────────────────────
  accent: {
    default:   '#FF5721',   // primary CTA, links
    hover:     '#E84D1C',   // hover state
    subtle:    '#FFF0EB',   // accent backgrounds (chips, badges)
    muted:     '#FFCAB8',   // accent border, ring
  },

  // ─── Semantic ─────────────────────────────────────────────
  semantic: {
    error:     '#DC2626',
    errorBg:   '#FEF2F2',
    success:   '#16A34A',
    successBg: '#F0FDF4',
    warning:   '#D97706',
    warningBg: '#FFFBEB',
  },
} as const

export type PaletteKey = typeof palette
