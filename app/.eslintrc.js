module.exports = {
  extends: ['algolia', 'plugin:import/typescript'],
  settings: {
    'import/resolver': {
      parcel: {
        extensions: ['.ts'],
      },
    },
  },
  parser: '@typescript-eslint/parser',
  overrides: [
    {
      files: ['*.js', '*.ts'],
      rules: {
        'no-param-reassign': 'off',
        'no-undef': 'off',
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
          },
        ],
      },
    },
  ],
};
