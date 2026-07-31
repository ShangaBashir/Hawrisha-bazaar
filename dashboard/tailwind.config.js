// tailwind.config.js
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./src/**/*.css"],
  theme: {
    extend: {
      colors: {
        "brand-rose": "#C08081",
        "brand-sage": "#B2AC88",
        "brand-beige": "#F5F5DC",
        "brand-charcoal": "#36454F",
      },
      fontFamily: {
        sans: ["Inter", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
