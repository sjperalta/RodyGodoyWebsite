/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ec5b13", // Warm Terracotta-ish from mockup
        "bg-light": "#f8f6f6",
        "bg-dark": "#221610",
        "neutral-soft": "#e5e1da",
        "accent-line": "#d1ccc4",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
}
