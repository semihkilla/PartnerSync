// tailwind.config.js
const { zinc } = require('tailwindcss/colors');

module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ...zinc,
        "primary-pink": "#f46abb",
        "secondary-pink": "#ee3ca0",
        "card-bg": "#232334",
        "accent-pink": "#ff89d6"
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(ellipse at top left, #ff89d6 0%, #f46abb 60%, #232334 100%)",
        "gradient-main": "linear-gradient(135deg, #ee3ca0 0%, #f46abb 60%, #232334 100%)",
      },
      boxShadow: {
        glow: "0 0 12px 2px #f46abb77",
        menu: "0 4px 24px 0 #ff89d6aa",
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s cubic-bezier(0.16,1,0.3,1) both"
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: 0, transform: "translateY(24px)" },
          to:   { opacity: 1, transform: "translateY(0)" }
        }
      }
    },
  },
  plugins: [],
};
