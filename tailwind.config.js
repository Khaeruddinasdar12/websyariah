/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // pastikan ini mencakup file kamu
  ],
  theme: {
    extend: {
      colors: {
        'sage-green': '#9CAF88',  // hijau lembut
        'deep-blue': '#1E3A8A',
        'gold': '#FBBF24',
      },
    },
  },
  plugins: [],
}
