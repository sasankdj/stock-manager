/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
extend: {
  colors: {
    primary: {
      50: "#fdf3ff",
      100: "#f9e0ff",
      200: "#f2bfff",
      300: "#e597ff",
      400: "#d56dff",
      500: "#be4bff",
      600: "#9f3acc",
      700: "#7c2b99",
      800: "#5a1c66",
      900: "#3a0f3d",
    },
    secondary: {
      50: "#f0fcff",
      100: "#d6f7ff",
      200: "#aeeeff",
      300: "#7be4ff",
      400: "#41d7ff",
      500: "#15c7ff",
      600: "#00a3d4",
      700: "#007ca8",
      800: "#00587a",
      900: "#00354a",
    },
    accent: {
      50: "#fffbe5",
      100: "#fff5c4",
      200: "#ffe88a",
      300: "#ffd44d",
      400: "#ffc21d",
      500: "#f5b000",
      600: "#c48c00",
      700: "#936900",
      800: "#624600",
      900: "#312300",
    },

    background: "#fafafa",
    card: "#ffffff",
    border: "#e5e7eb",
    input: "#f3f4f6",
    foreground: "#111827",
    "muted-foreground": "#6b7280",
    ring: "#be4bff",
  },
},

  },
  plugins: [],
}
