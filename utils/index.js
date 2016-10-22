let all = require('require-all');

module.exports = all({
  dirname: __dirname,
  filter: /^(?!index)(.+)\.js$/,
  recursive: true
});
