// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [],
    safelist: [
      // Add specific colors that might be dynamically used
      'bg-green-100',
      'bg-red-100',
      'bg-blue-100',
      'bg-purple-100',
      'border-green-300',
      'border-red-300',
      'border-blue-300',
      'border-purple-300',
      'text-green-800',
      'text-red-800',
      'text-blue-800',
      'text-purple-800'
    ]
  }