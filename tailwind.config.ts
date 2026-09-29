
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9fa",
          100: "#daeff2",
          200: "#b8dfe5",
          300: "#86c8d2",
          400: "#5db1bd",
          500: "#429CA8",
          600: "#357d87",
          700: "#2e6770",
          800: "#29555d",
          900: "#244850",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.06)",
      },
    },
  },
  plugins: [],
};
