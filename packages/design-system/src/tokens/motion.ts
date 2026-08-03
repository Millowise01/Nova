/**
 * Nova Motion System
 * Durations, easings, and Framer Motion presets.
 */
export const motion = {
  duration: {
    "75": "75ms",
    "100": "100ms",
    "200": "200ms",
    "300": "300ms",
    "500": "500ms",
    "700": "700ms",
    "1000": "1000ms",
    // Semantic aliases
    instant: "75ms",
    fast: "100ms",
    normal: "200ms",
    slow: "300ms",
    slower: "500ms",
    slowest: "700ms",
  },

  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
    /** Spring — overshoots for energetic entrances */
    spring: "cubic-bezier(0.16, 1, 0.3, 1)",
    // Named aliases matching CSS var names
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    emphasized: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },

  /** Framer Motion variants */
  presets: {
    // ── Hover transitions ──────────────────────────────────
    hoverLift: {
      initial: { y: 0, boxShadow: "var(--shadow-sm)" },
      hover: { y: -2, boxShadow: "var(--shadow-md)" },
    },
    hoverScale: {
      initial: { scale: 1 },
      hover: { scale: 1.02 },
    },

    // ── Fade ───────────────────────────────────────────────
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },

    // ── Modal animations ───────────────────────────────────
    modal: {
      initial: { opacity: 0, scale: 0.96, y: 8 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.96, y: 8 },
    },
    modalBackdrop: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },

    // ── Page transitions ───────────────────────────────────
    pageEnter: {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
    },
    slideInRight: {
      initial: { opacity: 0, x: 24 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -24 },
    },
    slideInLeft: {
      initial: { opacity: 0, x: -24 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 24 },
    },

    // ── Slide up/down ──────────────────────────────────────
    slideUp: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 8 },
    },
    slideDown: {
      initial: { opacity: 0, y: -8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
    },

    // ── Loading states ─────────────────────────────────────
    pulse: {
      animate: { opacity: [1, 0.4, 1] },
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
    shimmer: {
      animate: { x: ["-100%", "100%"] },
      transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
    },
    spin: {
      animate: { rotate: 360 },
      transition: { duration: 0.7, repeat: Infinity, ease: "linear" },
    },
  },
} as const;

export type MotionDuration = keyof typeof motion.duration;
export type MotionEasing = keyof typeof motion.easing;
export type MotionPreset = keyof typeof motion.presets;
