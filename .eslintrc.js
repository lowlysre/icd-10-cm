module.exports = {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended' // Integrate with Prettier for code formatting
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'latest', // Enables parsing of modern ECMAScript features
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
      // Add or override rules as needed
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  };
