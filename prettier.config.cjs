/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config & import('prettier-plugin-tailwindcss').PluginOptions}
 */
const config = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'none',
  printWidth: 100,
  plugins: ["prettier-plugin-tailwindcss"]
}

module.exports = config; 