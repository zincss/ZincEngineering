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
        acid: '#DFFF00',
        orokin: {
          400: '#E5CC80', 
          700: '#8A7129', 
          800: '#2A2410', 
          900: '#141108', 
          gold: '#D4AF37',
        }
      },
      keyframes: {
        // CONSOLIDATION: Renamed 'scroll' to 'ticker' and set to -50% for standard marquee effect
        ticker: { 
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }, 
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
        // CONSOLIDATION: Renamed 'scroll' to 'ticker'. 80s is good for performance.
        ticker: 'ticker 80s linear infinite', 
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}