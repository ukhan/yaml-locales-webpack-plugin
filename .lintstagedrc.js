module.exports = {
  '*.js': ['prettier --write', 'eslint --fix'],
  '*.{json,md,yml,yaml,css}': ['prettier --write'],
  'src/**/*.js': ['jest --bail --findRelatedTests']
};
