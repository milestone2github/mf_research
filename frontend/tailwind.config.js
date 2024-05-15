/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#242424",
        "light-bg": "#FEFEFF",
        "dark-blue": "#0692b5",
        "primary-white": "#FDFEFE",
        "light-gray": "#B1BCDA",
        "black-900": "#060B13",
        "gray-450": "#5F6874",
        "gray-750": "#3E4A5D",
        "light-blue": "#07A7CF",
        "success": "#6BAA75",
        "inactive-border": "#6b7280",
      },
    },
  },
  plugins: [],
}
