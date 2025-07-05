
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        '3xl': '1600px',
        '4xl': '1920px',
        '5xl': '2560px',
        '6xl': '3840px',
      },
      maxWidth: {
        '2k': '1800px',
        '4k': '2000px',
        'ultra': '2400px',
      },
      spacing: {
        'responsive-x': '1rem',
      },
      gridTemplateColumns: {
        '5': 'repeat(5, minmax(0, 1fr))',
        '6': 'repeat(6, minmax(0, 1fr))',
        '7': 'repeat(7, minmax(0, 1fr))',
        '8': 'repeat(8, minmax(0, 1fr))',
      }
    },
  },
  plugins: [],
}