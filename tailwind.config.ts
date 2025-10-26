module.exports = {
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontSize: {
        base: '15px',
      },
    },
    colors: {
      'cyan-400': 'rgb(91, 164, 164)',
      'cyan-50': 'rgb(239, 250, 250)',
      'grayish-cyan': 'rgb(123, 142, 142)',
      'cyan-900': 'rgb(44, 58, 58)',
    },
    fontFamily: {
      spartan: ['Spartan', 'sans-serif'],
    },
  },
  plugins: [],
}
