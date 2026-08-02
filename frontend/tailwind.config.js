/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF',      // page background
        surface: '#FFF9F3',    // card / elevated surface
        section: '#F8F5F2',    // grouped section background
        ink: '#1F2937',        // primary text
        fog: '#6B7280',        // secondary text
        line: '#E5E7EB',       // border
        primary: {
          DEFAULT: '#FF6B4A',  // coral
          soft: '#FFEAE3',
        },
        secondary: '#FFC93C',  // warm yellow
        signal: {
          green: '#2E9E6D',    // resolved — not in the brand spec, added for status semantics
          red: '#D9534F',      // failed/quota — same
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #FF6B4A 0%, #FFC93C 100%)',
      },
      fontFamily: {
        sans: ['var(--font-plex-sans)', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
