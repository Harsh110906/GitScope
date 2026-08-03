/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GitHub-inspired dark palette
        gh: {
          bg: '#0d1117',
          canvas: '#161b22',
          card: '#1c2128',
          border: '#30363d',
          borderMuted: '#21262d',
          fg: '#e6edf3',
          fgMuted: '#8b949e',
          fgSubtle: '#6e7681',
          accent: '#58a6ff',
          accentEmphasis: '#388bfd',
          success: '#3fb950',
          warning: '#d29922',
          danger: '#f85149',
          done: '#a371f7',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Noto Sans', 'Helvetica', 'Arial', 'sans-serif'],
        heading: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', '"Courier New"', 'monospace'],
      },
      borderRadius: {
        'gh': '6px',
        'gh-lg': '12px',
      },
    },
  },
  plugins: [],
}
