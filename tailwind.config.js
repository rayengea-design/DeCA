/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Sora", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#C0090E",
          50: "#FDECEC",
          100: "#FBD5D6",
          200: "#F5A8AA",
          300: "#EE7B7E",
          400: "#E14F52",
          500: "#C0090E",
          600: "#A3080C",
          700: "#7D060A",
          800: "#570407",
          900: "#310204",
        },
        ink: {
          DEFAULT: "#0A0A0A",
          50: "#F5F5F5",
          100: "#E5E5E5",
          200: "#CCCCCC",
          300: "#A3A3A3",
          400: "#737373",
          500: "#525252",
          600: "#3A3A3A",
          700: "#262626",
          800: "#171717",
          900: "#0A0A0A",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
