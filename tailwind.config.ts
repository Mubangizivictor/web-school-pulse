import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // School Pulse brand palette
        navy: {
          950: '#060D1F',
          900: '#0E1B3D',
          800: '#152649',
          700: '#1E3560',
        },
        amber: { brand: '#D4933A' },
        orange: { brand: '#F57C3A' },
        green: { brand: '#2ECC71' },
        blue: { brand: '#3A6FD4' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
