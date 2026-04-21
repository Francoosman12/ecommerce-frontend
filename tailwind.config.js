/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta principal Margarita — Cinderella
        cin: {
          50:  '#fcf5f4',
          100: '#f9eae7',
          200: '#f6dbd6',
          300: '#edbdb4',
          400: '#e19688',
          500: '#d27361',
          600: '#bd5845',
          700: '#9f4636',
          800: '#843d30',
          900: '#6f372d',
          950: '#3b1a14',
        },
        // Dorado del logo
        gold: {
          DEFAULT: '#D4A843',
          light:   '#E8C46A',
          dark:    '#A8832E',
        }
      },
      fontFamily: {
        // Tipografía elegante para moda femenina
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in':        'fadeIn 0.4s ease-out',
        'bounce-short':   'bounceShort 0.4s ease-out',
        'float':          'float 3s ease-in-out infinite',
      },
      keyframes: {
        slideInRight: {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        bounceShort: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.2)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' }
        }
      }
    },
  },
  plugins: [],
}