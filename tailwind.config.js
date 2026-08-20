import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#c2410c', // 赭红(朱砂)
          soft: '#ea580c',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Songti SC"', '"SimSun"', 'serif'],
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"PingFang SC"',
          '"Hiragino Sans GB"', '"Microsoft YaHei"', '"Segoe UI"', 'sans-serif',
        ],
      },
    },
  },
  plugins: [typography],
}
