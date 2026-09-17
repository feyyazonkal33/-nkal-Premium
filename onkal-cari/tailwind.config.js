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
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f5d76e 0%, #d4af37 50%, #aa8c2c 100%)',
      }
    },
  },
  plugins: [],
}