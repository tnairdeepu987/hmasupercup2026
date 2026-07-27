/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // World Cup 2026 (USA / Canada / Mexico) inspired palette
        pitch: {
          DEFAULT: '#0a7d3c',
          dark: '#065a2b',
          light: '#12a651',
        },
        gold: {
          DEFAULT: '#f7b500',
          dark: '#c98f00',
        },
        ink: {
          DEFAULT: '#0b1120',
          soft: '#151d2e',
          card: '#1c2740',
        },
      },
      fontFamily: {
        display: ['"Archivo Black"', 'Impact', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'stadium': 'radial-gradient(circle at 50% 0%, #12a651 0%, #065a2b 45%, #0b1120 100%)',
      },
    },
  },
  plugins: [],
}
