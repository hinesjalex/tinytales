/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FDFAF5",
        ink: "#2A2520",
        warm: {
          100: "#F5F0E1",
          200: "#E8E2DA",
          300: "#D9D2C9",
          400: "#C4B5A0",
          500: "#B5AA9C",
          600: "#8B7E72",
          700: "#6B6158",
          800: "#5C5347",
          900: "#3D3630",
        },
        accent: {
          DEFAULT: "#C4703F",
          light: "#FDF0E5",
          dark: "#A85C30",
        },
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["DM Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
