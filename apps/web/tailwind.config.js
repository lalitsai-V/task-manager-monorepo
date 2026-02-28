/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        'primary-hover': '#6D28D9',
        'primary-active': '#5B21B6'
      },
      backgroundImage: {
        // subtle carbon fiber pattern could also be added here if using an asset
        'carbon-fiber': "repeating-linear-gradient(45deg, #1a1a1a 0, #1a1a1a 1px, #111 1px, #111 2px)"
      }
    },
  },
  plugins: [],
}

