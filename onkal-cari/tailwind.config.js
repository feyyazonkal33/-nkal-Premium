/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#0a0b10', // Koyu lacivert/siyah zemin
        gold: {
          light: '#f5d76e',
          DEFAULT: '#d4af37', // Logo rengine uygun altın/gold vurgu rengi
          dark: '#aa8c2c',
        }
      }
    },
  },
  plugins: [],
}