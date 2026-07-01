import type { Config } from "tailwindcss";
import sharedConfig from "@nova/tailwind-config";

const config: Config = {
  presets: [sharedConfig],
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {}
  }
};

export default config;