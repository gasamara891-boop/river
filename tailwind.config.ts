import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'screen-xl': '75rem',
        'screen-2xl': '83.75rem'
      },
      boxShadow: {
        'cause-shadow': '0px 4px 17px 0px #00000008',
      },
      transitionDuration: {
        '150': '150ms',
      },
      spacing: {
        '6.25': '6.25rem',
        '70%': '70%',
        '40%': '40%',
        '30%': '30%',
        '80%': '80%',
        8.5: '8.5rem',
        50: '50rem',
        51: "54.375rem",
        25: '35.625rem',
        29: '28rem',
        120: '120rem',
        45: '45rem',
        94: '22.5rem',
        85: '21rem',
        3.75: '3.75rem'
      },
      inset: {
        '5%': '5%',
        '35%': '35%'
      },
      zIndex: {
        '1': '1',
        '2': '2',
        '999': '999'
      },
      colors: {
        
        primary: "#99E39E",         // amber (CTA) — strong and readable on dark
        secondary: "#38BDF8",       // soft cyan for accents
        midnight_text: "#BFCBD6",   // lighter gray for secondary text (readable on dark)
        muted: "#AAB6BF",           // muted text for less important labels
        error: "#EF4444",           // red
        warning: "#F7931A",         // orange/yellow
        light_grey: "#9AA6B2",      // label text on dark cards
        grey: "#F5F7FA",
        dark_grey: "#12151A",       // page card darker tone
        border: "#2A3340",          // subtle border on dark backgrounds
        success: "#16A34A",         // green success
        section: "#737373",
        darkmode: "#072322ff",        // page background (very dark navy)
        darklight: "#0b2f26",
        dark_border: "#1f2933",
        tealGreen: "#2DD4BF",
        charcoalGray: "#666C78",
        deepSlate: "#0f1724",
        slateGray: "#0f1724",
        /* Useful named colors for cards / subtle surfaces */
        dark_card: "#0F1724",       // slightly lighter than page bg for cards
        muted_card: "#0b1228",
        slate800: "#111827",
      },
      fontSize: {
        86: [
          "5.375rem",
          {
            lineHeight: "1.2",
          }
        ],
        76: [
          "4.75rem",
          {
            lineHeight: "1.2",
          }
        ],
        70: [
          "4.375rem",
          {
            lineHeight: "1.2",
          }
        ],
        54: [
          "3.375rem",
          {
            lineHeight: "1.2",
          }
        ],
        44: [
          "2.75rem",
          {
            lineHeight: "1.3",
          }
        ],
        40: [
          "2.5rem",
          {
            lineHeight: "3rem",
          },
        ],
        36: [
          "2.25rem",
          {
            lineHeight: "2.625rem",
          },
        ],
        30: [
          "1.875rem",
          {
            lineHeight: "2.25rem",
          },
        ],
        28: [
          "1.75rem",
          {
            lineHeight: "2.25rem",
          },
        ],
        24: [
          "1.5rem",
          {
            lineHeight: "2rem",
          },
        ],
        22: [
          "1.375rem",
          {
            lineHeight: "2rem",
          },
        ],
        21: [
          "1.3125rem",
          {
            lineHeight: "1.875rem",
          },
        ],
        18: [
          "1.125rem",
          {
            lineHeight: "1.5rem",
          },
        ],
        17: [
          "1.0625rem",
          {
            lineHeight: "1.4875rem",
          },
        ],
        16: [
          "1rem",
          {
            lineHeight: "1.6875rem",
          },
        ],
        14: [
          "0.875rem",
          {
            lineHeight: "1.225rem",
          },
        ],
      },
      backgroundImage: {
        "start": "url('/images/work/bg-start.png')",
        "perk": "url('/images/perks/perk-bg.png')",
      },
      blur: {
        220: '220px',
        400: '400px',
      }
    },
  },
  plugins: [],
};
export default config;