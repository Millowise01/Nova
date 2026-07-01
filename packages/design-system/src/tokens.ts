export const tokens = {
  spacing: {
    0: "0rem",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem"
  },
  radius: {
    none: "0px",
    sm: "0.375rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    pill: "9999px"
  },
  elevation: {
    1: "0 1px 2px rgba(15, 23, 42, 0.08)",
    2: "0 6px 16px rgba(15, 23, 42, 0.12)",
    3: "0 20px 40px rgba(15, 23, 42, 0.16)"
  },
  motion: {
    duration: {
      fast: "120ms",
      normal: "180ms",
      slow: "260ms"
    },
    easing: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      emphasized: "cubic-bezier(0.16, 1, 0.3, 1)"
    }
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    toast: 1400,
    tooltip: 1500
  },
  breakpoints: {
    xs: "30rem",
    sm: "40rem",
    md: "48rem",
    lg: "64rem",
    xl: "80rem",
    "2xl": "96rem"
  }
} as const;