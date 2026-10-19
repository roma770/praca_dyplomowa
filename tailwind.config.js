/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#fdf2f8',
          rose: '#f43f5e',
          dark: '#1e293b',
          wood: '#451a03',
        }
      }
    },
  },
  plugins: [],
}