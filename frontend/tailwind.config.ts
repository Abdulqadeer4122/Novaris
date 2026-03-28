import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#0A0E27", mid: "#141830" },
        gold: { DEFAULT: "#C9A84C", soft: "#F5EDD6" },
        silver: "#F0F2F8",
        surface: "#F8F7F4",
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
