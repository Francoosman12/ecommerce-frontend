/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gold: "#D4A843",
        cin: {
          50:  "#fdf8f7",
          100: "#faf0ee",
          200: "#f6dbd6",
          300: "#edbdb4",
          400: "#e19688",
          500: "#cf6f5e",
          600: "#bd5845",
          700: "#9f4636",
          800: "#843d30",
          900: "#6f372d",
          950: "#3b1a14",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        sans:    ["DM Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "float":     "float 4s ease-in-out infinite",
        "fade-in":   "fadeIn .4s ease-out",
        "slide-in-right": "slideInRight .3s ease-out",
        "scroll-up": "scrollUp 9s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { transform: "translateX(100%)" },
          to:   { transform: "translateX(0)" },
        },
        scrollUp: {
          "0%":   { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
      },
    },
  },
  plugins: [],
};