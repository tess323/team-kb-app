import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-jakarta)', 'sans-serif'],
        serif: ['Georgia', 'serif'],
      },
      colors: {
        hunter:    { DEFAULT: '#2D4739', mid: '#3D6B52', light: '#A8D0B8', muted: '#D4E8DC' },
        ochre:     { DEFAULT: '#C8860A', mid: '#E09A20', light: '#FDE8C0', muted: '#FEF4E0' },
        rose:      { DEFAULT: '#C4394A', mid: '#D95060', light: '#FDDDE0', muted: '#FEF0F1' },
        slate:     { DEFAULT: '#384457', mid: '#4A5A70', light: '#C0D0E0', muted: '#E8EEF5' },
        parchment: { DEFAULT: '#F5EDD8', dark: '#E0D0B0', text: '#8C6A30', deep: '#3A2810' },
        cream:     { DEFAULT: '#FAF6EE', dark: '#EAE0CC', text: '#8C7A5E', deep: '#3A2E1A' },
        ink:       { DEFAULT: '#1A1205' },
      },
      borderRadius: {
        sm:  '4px',
        DEFAULT: '6px',
        md:  '6px',
        lg:  '8px',
        xl:  '12px',
      },
      fontSize: {
        '2xs': ['9px',  { letterSpacing: '0.1em' }],
        xs:    ['11px', { lineHeight: '1.5' }],
        sm:    ['12.5px', { lineHeight: '1.55' }],
        base:  ['13px', { lineHeight: '1.65' }],
        lg:    ['14px', { lineHeight: '1.5' }],
        xl:    ['16px', { lineHeight: '1.4' }],
        '2xl': ['20px', { lineHeight: '1.2' }],
        '3xl': ['28px', { lineHeight: '1.1' }],
        '4xl': ['40px', { lineHeight: '0.95' }],
      },
    },
  },
  plugins: [],
}

export default config
