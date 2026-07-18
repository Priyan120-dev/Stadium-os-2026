/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    "./src/agents/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          dark: "#050811",
          card: "#090e18",
          panel: "rgba(13, 20, 38, 0.45)",
          border: "rgba(255, 255, 255, 0.08)",
        },
        stadium: {
          green: "#00e676",
          blue: "#00b0ff",
          gold: "#ffd700",
          amber: "#ff6d00",
          red: "#ff1744",
        }
      },
      fontFamily: {
        display: ["Outfit", "sans-serif"],
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 15px rgba(0, 230, 118, 0.15)",
        "neon-red": "0 0 20px rgba(255, 23, 68, 0.25)",
        "neon-amber": "0 0 20px rgba(255, 109, 0, 0.25)",
        "neon-blue": "0 0 15px rgba(0, 176, 255, 0.15)",
        "neon-gold": "0 0 15px rgba(255, 215, 0, 0.15)",
      }
    },
  },
  plugins: [],
}
