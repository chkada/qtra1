const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      colors: {
        'aguirre-blue': {
          100: '#E6F0FF',
          200: '#B8D4FF',
          300: '#8AB9FF',
          400: '#5C9EFF',
          500: '#2E83FF',
          600: '#0068FF',
          700: '#0052CC',
          800: '#003D99',
          900: '#002966',
        },
        'aguirre-sky': {
          100: '#E6F7FF',
          200: '#B8EFFF',
          300: '#8AD7FF',
          400: '#5CD0FF',
          500: '#2EC8FF',
          600: '#00BFFF',
          700: '#0099CC',
          800: '#007399',
          900: '#004D66',
        },
        'aguirre-red': {
          100: '#FFE6E6',
          200: '#FFB8B8',
          300: '#FF8A8A',
          400: '#FF5C5C',
          500: '#FF2E2E',
          600: '#FF0000',
          700: '#CC0000',
          800: '#990000',
          900: '#660000',
        },
        'aguirre-green': {
          100: '#E6FFFA',
          200: '#B8FFF4',
          300: '#8AFFF0',
          400: '#5CFFEB',
          500: '#2EFFE6',
          600: '#00FFDC',
          700: '#00CCB0',
          800: '#009984',
          900: '#006658',
        },
      },
    },
  },
  plugins: [],
};