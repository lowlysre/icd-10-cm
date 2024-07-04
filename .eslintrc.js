module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true,
      'jest/globals': true, // Enables Jest globals like 'describe', 'it', etc.
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:jest/recommended',
      'plugin:prettier/recommended' // Integrate with Prettier for code formatting
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest', // Enables parsing of modern ECMAScript features
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'jest'],
    rules: {
      // Add or override rules as needed
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  };
