/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "#e5e7eb",
        background: "#0F0F0F",
        foreground: "#F1F5F9",
        primary: "#84CC16",
        secondary: "#F59E42",
        card: "#ffffff",
        surface: "#232D1A",
        text: "#F1F5F9",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

