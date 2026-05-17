import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f1419',
        'dark-card': '#1a2332',
        'dark-border': '#2a3a4a',
        'accent-green': '#00d4aa',
        'accent-red': '#ff4757',
      },
    },
  },
  plugins: [],
}
export default config
