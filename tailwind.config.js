/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/demo-app/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms")],
};
