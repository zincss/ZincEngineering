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
      fontFamily: {
        // Ensure you have a mono font stack (default is usually Courier/Consolas)
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      colors: {
        // Replaced Acid with a Technical Orange/Amber
        safety: {
          DEFAULT: '#FF5F00', // International Orange
          500: '#FF5F00',
        },
        zinc: {
          // Deepening the blacks for high contrast
          950: '#09090b', 
          900: '#18181b',
          850: '#202022', // Custom panel color
        }
      },
      backgroundImage: {
        // Technical Grid Pattern
        'grid-pattern': "linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-md': '40px 40px',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      },
      colors: {
        brand: 'var(--brand)',
        main: 'var(--bg-main)',
        card: 'var(--bg-card)',
      },
      animation: {
        ticker: 'ticker 60s linear infinite',
        scanline: 'scanline 8s linear infinite',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}