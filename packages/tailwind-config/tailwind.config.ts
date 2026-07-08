import type { Config } from "tailwindcss";

export const novaTheme = {
  colors: {
    brand: {
      50: "#edfdf7",
      100: "#d2f8ea",
      200: "#a8efd5",
      300: "#75e1ba",
      400: "#41ca94",
      500: "#1ca374",
      600: "#157e5c",
      700: "#10614a",
      800: "#0d4d3c",
      900: "#0b4132",
    },
  },
  fontFamily: {
    sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
    mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
  },
} satisfies Config["theme"];

const config: Config = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: novaTheme,
  },
  plugins: [],
};

export default config;
