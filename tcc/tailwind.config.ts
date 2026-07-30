import type { Config } from "tailwindcss";
import defaultColors from "tailwindcss/colors";

/**
 * withOpacity() produces the Tailwind-recommended pattern for a
 * CSS-variable-backed color that still supports opacity modifiers
 * (e.g. `bg-emerald-400/10`). The CSS variable must hold a space-separated
 * RGB triplet (e.g. "52 211 153") — see app/globals.css `:root`.
 */
function withOpacity(cssVar: string) {
  return `rgb(var(${cssVar}) / <alpha-value>)`;
}

export default {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Full zinc scale is theme-aware (dark/light) via CSS variables.
        // Every other Tailwind color/shade not listed here falls back to
        // its normal default value, unaffected by the theme toggle.
        zinc: {
          ...defaultColors.zinc,
          50: withOpacity("--zinc-50"),
          100: withOpacity("--zinc-100"),
          200: withOpacity("--zinc-200"),
          300: withOpacity("--zinc-300"),
          400: withOpacity("--zinc-400"),
          500: withOpacity("--zinc-500"),
          600: withOpacity("--zinc-600"),
          700: withOpacity("--zinc-700"),
          800: withOpacity("--zinc-800"),
          900: withOpacity("--zinc-900"),
          950: withOpacity("--zinc-950"),
        },
        emerald: {
          ...defaultColors.emerald,
          400: withOpacity("--emerald-400"),
        },
        rose: {
          ...defaultColors.rose,
          400: withOpacity("--rose-400"),
        },
        blue: {
          ...defaultColors.blue,
          400: withOpacity("--blue-400"),
        },
        amber: {
          ...defaultColors.amber,
          400: withOpacity("--amber-400"),
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
