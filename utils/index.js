const all = require('./RequireAll.js');

module.exports = all({
  dirname: __dirname,
  filter: /^(?!index)(.+)\.js$/,
  recursive: true
});
