/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Surface colors
        'surface': '#f8f9ff',
        'surface-dim': '#cbdbf5',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#424753',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        'outline': '#727785',
        'outline-variant': '#c2c6d5',
        'surface-tint': '#005ac4',

        // Primary colors
        'primary': '#00459a',
        'on-primary': '#ffffff',
        'primary-container': '#005cc8',
        'on-primary-container': '#cfdcff',
        'inverse-primary': '#aec6ff',
        'primary-fixed': '#d8e2ff',
        'primary-fixed-dim': '#aec6ff',
        'on-primary-fixed': '#001a42',
        'on-primary-fixed-variant': '#004396',

        // Secondary colors
        'secondary': '#00677d',
        'on-secondary': '#ffffff',
        'secondary-container': '#50d9fe',
        'on-secondary-container': '#005c70',
        'secondary-fixed': '#b3ebff',
        'secondary-fixed-dim': '#4cd6fb',
        'on-secondary-fixed': '#001f27',
        'on-secondary-fixed-variant': '#004e5f',

        // Tertiary colors
        'tertiary': '#414a4f',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#596267',
        'on-tertiary-container': '#d4dde3',
        'tertiary-fixed': '#dbe4ea',
        'tertiary-fixed-dim': '#bfc8ce',
        'on-primary-fixed': '#141d21',
        'on-primary-fixed-variant': '#3f484d',

        // Error colors
        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        // Background
        'bg-primary': '#f8f9ff',
        'bg-surface': '#ffffff',
      },
      spacing: {
        'base': '4px',
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
        'container-margin': '32px',
        'gutter': '20px',
        'sidebar-width': '260px',
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.75rem',
        'lg': '1rem',
        'full': '9999px',
      },
      fontSize: {
        'h1': ['30px', { lineHeight: '38px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        'mono-data': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
      },
      boxShadow: {
        'ambient-sm': '0px 4px 20px rgba(0, 92, 200, 0.05)',
        'ambient-md': '0px 10px 32px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
