module.exports = {
  extends: ['algolia'],
  overrides: [
    {
      files: ['*.js'],
      rules: {
        'no-param-reassign': 'off',
      },
    },
  ],
};
