import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class', // <--- ADD THIS LINE. It enables the toggle logic.
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        acid: '#DFFF00', // Your custom acid green
        'orokin-gold': '#D4AF37',
        'orokin-800': '#1a1a1a', // Example placeholder if you used custom colors
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
      require("tailwindcss-animate"), // Ensure you have this if using animate-in classes
  ],
}
export default config