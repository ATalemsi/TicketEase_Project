/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Includes all HTML and TypeScript files
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#80FFDB',
          200: '#72EFDD',
          300: '#64DFDF',
          400: '#56CFE1',
          500: '#48BFE3',
          600: '#4EA8DE',
          700: '#5390D9',
          800: '#5E60CE',
          900: '#6930C3',
          950: '#7400B8',
        },
      },
    },
  },
  plugins: [],
};
