module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier'],
  plugins: ['prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // General ESLint rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-duplicate-imports': 'error',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // Code quality rules following SOLID principles
    'max-lines-per-function': [
      'warn',
      { max: 200, skipBlankLines: true, skipComments: true },
    ],
    'max-params': ['warn', 4],
    complexity: ['warn', 10],
    'max-depth': ['warn', 4],
    'max-nested-callbacks': ['warn', 3],
  },
  overrides: [
    // TypeScript files
    {
      files: ['**/*.ts', '**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'prettier'],
      rules: {
        // Disable base rules that are covered by TypeScript
        'no-unused-vars': 'off',
        'no-undef': 'off',

        // TypeScript specific rules
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
      },
    },
    // React specific rules for web app
    {
      files: ['apps/web/**/*.{ts,tsx}'],
      env: {
        browser: true,
      },
      plugins: ['react', 'react-hooks', 'jsx-a11y'],
      rules: {
        'react/react-in-jsx-scope': 'off', // Not needed in React 17+
        'react/prop-types': 'off', // Using TypeScript for prop validation
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
      },
    },
    // Node.js specific rules for backend
    {
      files: ['apps/email-service/**/*.ts'],
      env: {
        node: true,
        browser: false,
      },
      rules: {
        'no-console': 'off', // Allow console in backend
      },
    },
    // Test files
    {
      files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'max-lines-per-function': 'off',
      },
    },
    // Configuration files
    {
      files: ['*.config.{js,ts}', '*.config.*.{js,ts}', '.eslintrc.cjs'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    '*.min.js',
    'coverage/',
    '.next/',
    '.vercel/',
    '.railway/',
  ],
};
