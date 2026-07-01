import type { Config } from "tailwindcss";

export const novaTheme = {
  colors: {
    bg: "hsl(var(--bg))",
    fg: "hsl(var(--fg))",
    brand: {
      50: "#eefbf7",
      100: "#d7f7ec",
      200: "#afeed9",
      300: "#7fdfbf",
      400: "#4fc99d",
      500: "#22a67a",
      600: "#18855f",
      700: "#13674c",
      800: "#104f3d",
      900: "#0e4233"
    }
  },
  fontFamily: {
    sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
    mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"]
  }
} satisfies Config["theme"];

const config: Config = {
  darkMode: ["class"],
  content: [],
  theme: {
    extend: novaTheme
  },
  plugins: []
};

export default config;