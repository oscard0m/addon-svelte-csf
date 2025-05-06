/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  tabWidth: 2,
  bracketSpacing: true,
  trailingComma: 'es5',
  singleQuote: true,
  arrowParens: 'always',
  plugins: ['prettier-plugin-svelte'],
  overrides: [
    {
      files: '*.svelte',
      options: { parser: 'svelte' },
    },
  ],
};

export default config;
