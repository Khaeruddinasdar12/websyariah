/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sage-green': '#1B7A6A',
        'soft-green': '#2D9B88',
        'deep-blue': '#0D4A42',
        'gold': '#C9A227',
        'gold-light': '#E8C547',
        'cream': '#fffdf8',
      },
    },
  },
  plugins: [],
}
