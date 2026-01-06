import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Instagram gradient colors
          from: "#8B5CF6",
          via: "#EC4899",
          to: "#F97316",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Semantic colors
        success: {
          DEFAULT: "#22C55E",
          light: "#86EFAC",
          dark: "#16A34A",
          bg: "#F0FDF4",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FCD34D",
          dark: "#D97706",
          bg: "#FFFBEB",
        },
        error: {
          DEFAULT: "#EF4444",
          light: "#FCA5A5",
          dark: "#DC2626",
          bg: "#FEF2F2",
        },
        info: {
          DEFAULT: "#3B82F6",
          light: "#93C5FD",
          dark: "#2563EB",
          bg: "#EFF6FF",
        },
        // Surface colors
        surface: "hsl(var(--color-surface) / <alpha-value>)",
        "surface-elevated": "hsl(var(--color-surface-elevated) / <alpha-value>)",
        // Text colors
        "text-primary": "hsl(var(--color-text-primary) / <alpha-value>)",
        "text-secondary": "hsl(var(--color-text-secondary) / <alpha-value>)",
        "text-tertiary": "hsl(var(--color-text-tertiary) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Extended border radius scale (new values)
        xl: "1.5rem", // 24px
        "2xl": "2rem", // 32px
        full: "9999px",
      },
      boxShadow: {
        // Light mode shadows
        sm: "0 1px 2px rgba(0,0,0,0.05)",
        DEFAULT: "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
        md: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
        lg: "0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
        xl: "0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)",
        "2xl": "0 25px 50px rgba(0,0,0,0.15)",
        drag: "0 32px 64px rgba(139,92,246,0.25)",
        // Dark mode shadows (stronger opacity)
        "sm-dark": "0 1px 2px rgba(0,0,0,0.3)",
        "md-dark": "0 4px 6px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.4)",
        "lg-dark": "0 10px 15px rgba(0,0,0,0.6), 0 4px 6px rgba(0,0,0,0.5)",
        "xl-dark": "0 20px 25px rgba(0,0,0,0.7), 0 10px 10px rgba(0,0,0,0.6)",
        "2xl-dark": "0 25px 50px rgba(0,0,0,0.8)",
        "drag-dark": "0 32px 64px rgba(139,92,246,0.4)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      fontSize: {
        caption: ["0.75rem", { lineHeight: "1rem" }], // 12px
        small: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
        body: ["1rem", { lineHeight: "1.5rem" }], // 16px
        "body-lg": ["1.125rem", { lineHeight: "1.75rem" }], // 18px
        h6: ["1.5rem", { lineHeight: "2rem", fontWeight: "600" }], // 24px
        h5: ["1.875rem", { lineHeight: "2.25rem", fontWeight: "600" }], // 30px
        h4: ["2.25rem", { lineHeight: "2.75rem", fontWeight: "600" }], // 36px
        h3: ["3rem", { lineHeight: "3.5rem", fontWeight: "700" }], // 48px
        h2: ["3.75rem", { lineHeight: "4.5rem", fontWeight: "700" }], // 60px
        h1: ["4.5rem", { lineHeight: "5.5rem", fontWeight: "800" }], // 72px
        display: ["6rem", { lineHeight: "7rem", fontWeight: "800" }], // 96px
        hero: ["7.5rem", { lineHeight: "8.5rem", fontWeight: "900" }], // 120px
      },
      spacing: {
        "11": "2.75rem", // 44px - Touch target minimum
        "18": "4.5rem", // 72px
        "22": "5.5rem", // 88px
        "26": "6.5rem", // 104px
        "28": "7rem", // 112px
        "30": "7.5rem", // 120px
        "34": "8.5rem", // 136px
        "36": "9rem", // 144px
        "40": "10rem", // 160px
        "44": "11rem", // 176px
        "48": "12rem", // 192px
        "52": "13rem", // 208px
        "56": "14rem", // 224px
        "60": "15rem", // 240px
        "64": "16rem", // 256px
        "72": "18rem", // 288px
        "80": "20rem", // 320px
        "96": "24rem", // 384px
      },
      animationDuration: {
        "50": "50ms",
        "100": "100ms",
        "150": "150ms",
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
        "600": "600ms",
      },
      animationTimingFunction: {
        spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
      keyframes: {
        "slide-in-from-bottom": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "slide-in-from-top": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "zoom-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    tailwindAnimate,
    // Custom plugin for gradient borders (Instagram-like)
    function({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.border-gradient': {
          border: '2px solid transparent',
          'background-clip': 'padding-box, border-box',
          'background-origin': 'padding-box, border-box',
          'background-image':
            'linear-gradient(to right, white, white), ' +
            'linear-gradient(to right, #8B5CF6, #EC4899, #F97316)',
        },
      })
    },
    // T071: Plugin for hiding scrollbars on mobile
    function({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.scrollbar-hide': {
          /* Hide scrollbar for Chrome, Safari and Opera */
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            'display': 'none',
          },
        },
      })
    },
  ],
} satisfies Config;
