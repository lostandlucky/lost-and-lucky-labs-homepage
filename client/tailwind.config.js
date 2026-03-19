/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Cabin', 'sans-serif'],
        body: ['Esteban', 'serif'],
      },
    },
  },
  plugins: [],
};
