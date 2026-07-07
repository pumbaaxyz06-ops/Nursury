import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E7D32",
          light: "#E8F5E9",
          50: "#E8F5E9",
          600: "#2E7D32",
          700: "#1B5E20",
          800: "#1B5E20",
          900: "#0F3D17",
        },
        secondary: "#4CAF50",
        accent: "#8BC34A",
        earth: "#8D6E63",
        sky: "#4FC3F7",
        warning: "#FFA726",
        danger: "#EF5350",
        success: "#43A047",
        neutral: {
          900: "#1F2937",
          600: "#6B7280",
          50: "#F7FAF8",
        },
        "surface-green": "#F2F8F4",
      },
      boxShadow: {
        'premium-sm': '0 4px 12px rgba(0,0,0,0.03)',
        'premium-md': '0 10px 30px rgba(0,0,0,0.05)',
        'premium-lg': '0 20px 40px rgba(46,125,50,0.06)',
        'premium-float': '0 20px 40px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px 0 rgba(46, 125, 50, 0.05)',
      }
    },
  },
  plugins: [],
};
export default config;