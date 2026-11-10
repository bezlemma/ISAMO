/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.{js,vue,ts}",
    "./pages/**/*.{js,vue,ts}",
    "./plugins/**/*.{js,vue,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        brand: Object.fromEntries(
          ['DEFAULT', 'deep', 'fill', 'on-fill', 'hover', 'highlight', 'trim', 'soft', 'line', 'surface']
            .map(name => [name, 'rgb(var(--brand' + (name === 'DEFAULT' ? '' : '-' + name) + ') / <alpha-value>)'])
        ),
      },
    },
  },
  plugins: [],
}

