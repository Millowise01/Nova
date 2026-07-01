import { tokens } from "./tokens";

export const motion = tokens.motion;

export const motionPresets = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  slideUp: {
    initial: { opacity: 0, transform: "translateY(12px)" },
    animate: { opacity: 1, transform: "translateY(0px)" },
    exit: { opacity: 0, transform: "translateY(12px)" }
  },
  scale: {
    initial: { opacity: 0, transform: "scale(0.98)" },
    animate: { opacity: 1, transform: "scale(1)" },
    exit: { opacity: 0, transform: "scale(0.98)" }
  }
} as const;