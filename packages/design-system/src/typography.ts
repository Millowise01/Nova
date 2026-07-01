export const typography = {
  display: {
    xl: { fontSize: "4.5rem", lineHeight: 1, fontWeight: 700, letterSpacing: "-0.05em" },
    l: { fontSize: "3.75rem", lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.04em" },
    m: { fontSize: "3rem", lineHeight: 1.1, fontWeight: 650, letterSpacing: "-0.03em" }
  },
  heading: {
    xl: { fontSize: "2.5rem", lineHeight: 1.1, fontWeight: 650 },
    l: { fontSize: "2rem", lineHeight: 1.15, fontWeight: 650 },
    m: { fontSize: "1.5rem", lineHeight: 1.2, fontWeight: 600 },
    s: { fontSize: "1.125rem", lineHeight: 1.3, fontWeight: 600 }
  },
  body: {
    xl: { fontSize: "1.125rem", lineHeight: 1.6, fontWeight: 400 },
    l: { fontSize: "1rem", lineHeight: 1.6, fontWeight: 400 },
    m: { fontSize: "0.9375rem", lineHeight: 1.55, fontWeight: 400 },
    s: { fontSize: "0.875rem", lineHeight: 1.5, fontWeight: 400 }
  },
  caption: { fontSize: "0.75rem", lineHeight: 1.4, fontWeight: 400 },
  label: { fontSize: "0.875rem", lineHeight: 1.35, fontWeight: 600 },
  button: { fontSize: "0.9375rem", lineHeight: 1.2, fontWeight: 600 }
} as const;