/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#3B54B8', dark: '#3B54B8', deeper: '#2C3F94', light: '#E8ECFA', mint: '#B9C3EB' },
        success: { DEFAULT: '#16A34A', dark: '#166534', light: '#DCFCE7' },
        accent: { DEFAULT: '#F59E0B', light: '#fef3c7' },
        surface: '#f7f9fb',
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
