module.exports = {
  extends: ['algolia'],
  overrides: [
    {
      files: ['*.js', '*.ts'],
      rules: {
        'no-param-reassign': 'off',
        'no-undef': 'off'
      },
    },
  ],
};
