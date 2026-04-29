/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Mistral light mode palette ───────────────────────
        bg: {
          base:    '#FFFFFF',
          subtle:  '#F7F7F8',
          muted:   '#EFEFEF',
          overlay: '#E8E8EA',
        },
        border: {
          default: '#E5E5E7',
          strong:  '#CACAD0',
          subtle:  '#F0F0F2',
        },
        text: {
          primary:   '#0D0D0D',
          secondary: '#666677',
          muted:     '#9B9BA8',
          inverted:  '#FFFFFF',
        },
        accent: {
          DEFAULT: '#FF5721',
          hover:   '#E84D1C',
          subtle:  '#FFF0EB',
          muted:   '#FFCAB8',
        },
      },
    },
  },
  plugins: [],
}
