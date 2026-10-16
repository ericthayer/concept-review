// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', '.build/**', 'node_modules/**', 'test-results/**', 'playwright-report/**'] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: { allowDefaultProject: ['eslint.config.js'] }, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true, allowTypedFunctionExpressions: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'no-console': ['error', { allow: ['log', 'error'] }],
    },
  },
  {
    // Browser code: no innerHTML, no Node built-ins, no console noise.
    files: ['src/main.ts', 'src/components/**/*.ts', 'src/dom/**/*.ts'],
    rules: {
      'no-console': 'error',
      'no-restricted-imports': ['error', { patterns: ['node:*'] }],
      'no-restricted-properties': [
        'error',
        { property: 'innerHTML', message: 'Build DOM with createElement/textContent.' },
        { property: 'outerHTML', message: 'Build DOM with createElement/textContent.' },
      ],
    },
  },
  {
    // node:test's describe/it return promises the runner tracks itself.
    files: ['tests/unit/**/*.ts'],
    rules: { '@typescript-eslint/no-floating-promises': 'off' },
  },
  {
    files: ['eslint.config.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
