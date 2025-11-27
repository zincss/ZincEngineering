/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Detected from app/page.tsx and globals.css
        acid: '#DFFF00',
        // Approximate matches for ModCard.tsx usages
        orokin: {
          400: '#E5CC80', 
          700: '#8A7129', 
          800: '#2A2410', 
          900: '#141108', 
          gold: '#D4AF37', // Derived from shadow-rgba(212,175,55)
        }
      },
      // Detected from app/sports/nba/page.tsx
      keyframes: {
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        scroll: 'scroll 40s linear infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Required for 'animate-in', 'fade-in' classes seen in your files
  ],
}