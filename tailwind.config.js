/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e6daff',
          300: '#d4bfff',
          400: '#b89bff',
          500: '#9b76f0',
          600: '#7e57d8',
          700: '#6843b8',
        },
        blush: {
          50: '#fff5f7',
          100: '#ffe4eb',
          200: '#ffc8d6',
          300: '#ffa1bb',
          400: '#ff789a',
          500: '#f25478',
          600: '#d63960',
          700: '#b22a4d',
        },
        sage: {
          50: '#f4f9f4',
          100: '#e3f0e1',
          200: '#c5dfc2',
          300: '#9ec79c',
          400: '#7bb079',
          500: '#5e955f',
          600: '#477849',
          700: '#385e3a',
        },
        cream: {
          50: '#fffdf8',
          100: '#fdf8ec',
          200: '#faf0d3',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(155, 118, 240, 0.12)',
      },
    },
  },
  plugins: [],
};
