/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F5F6F7",   // page background (off-white, was warm cream)
        ink: "#0A0A0A",     // near-black — text, nav, dark surfaces
        gold: "#7965F5",    // primary accent (purple, replaces gold)
        sand: "#E8E8E8",    // neutral borders/dividers
        stone: "#707178",   // muted secondary text
        mint: "#8EE6D0",    // secondary accent — success/highlight
        purple2: "#B78CFF", // accent gradient partner for gold/purple
      },
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "spin-slow": {
          to: { transform: "rotate(360deg)" },
        },
        "spin-slow-reverse": {
          to: { transform: "rotate(-360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.4)", opacity: "0" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
      animation: {
        "spin-slow": "spin-slow 26s linear infinite",
        "spin-slow-reverse": "spin-slow-reverse 34s linear infinite",
        float: "float 5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 3s cubic-bezier(0.2,0.6,0.4,1) infinite",
      },
    },
  },
  plugins: [],
};
