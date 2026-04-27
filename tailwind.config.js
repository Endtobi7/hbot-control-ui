module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f8f8f8",
          100: "#e8e8e8",
          200: "#d0d0d0",
          300: "#a8a8a8",
          400: "#808080",
          500: "#5a5a5a",
          600: "#3f3f3f",
          700: "#2a2a2a",
          800: "#1a1a1a",
          900: "#0f0f0f",
        },
        accent: {
          red: "#ef4444",
          green: "#22c55e",
          blue: "#3b82f6",
          yellow: "#eab308",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
}