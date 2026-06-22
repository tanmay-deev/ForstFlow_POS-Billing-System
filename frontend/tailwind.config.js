/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vanilla: '#FFF8EE',
        chocolate: '#4B2E2E',
        strawberry: '#F472B6',
        caramel: '#FB923C',
        mint: '#22C55E',
        softRed: '#EF4444',
        slateGray: '#334155',
        // Premium Dark Mode Palette
        espresso: '#140F0E',
        mocha: '#1E1715',
        crema: '#FDFBF7',
        latte: '#A89B98',
        cacao: '#3A2C29'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
      spacing: {
        tiny: '4px',
        small: '8px',
        default: '16px',
        section: '24px',
        large: '32px',
        page: '48px',
        hero: '64px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        medium: '0 10px 30px -5px rgba(0, 0, 0, 0.1)',
        strong: '0 20px 40px -5px rgba(0, 0, 0, 0.15)',
        glow: '0 0 20px rgba(251, 146, 60, 0.3)',
      },
      borderRadius: {
        DEFAULT: '12px',
        md: '16px',
        lg: '20px',
        xl: '28px',
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(28,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.1) 0px, transparent 50%)',
      },
      animation: {
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
