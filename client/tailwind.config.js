/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf4ee',
          100: '#fae4d0',
          200: '#f5c69e',
          300: '#ef9f63',
          400: '#e87a30',
          500: '#e35d12',
          600: '#c94509',
          700: '#a53310',
          800: '#842b14',
          900: '#6c2613',
          950: '#3a1008',
        },
        cinema: {
          950: '#0a0a0f',
          900: '#12121a',
          800: '#1c1c28',
          700: '#26263a',
          600: '#32324e',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};