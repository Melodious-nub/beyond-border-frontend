/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/auth/**/*.{html,ts}",
    "./src/app/admin/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#A50034', // Your brand color
          600: '#991b1b',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        }
      }
    },
  },
  plugins: [],
  // Only apply Tailwind to admin routes
  safelist: [
    // Admin-specific classes
    'admin-tailwind'
  ]
}
