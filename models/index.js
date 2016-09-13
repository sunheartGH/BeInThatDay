let mongoose = require('mongoose'),
    all = require('require-all'),
    config = require('config-lite').mongodb;

mongoose.connect(config.url, (err) => {
  if (err) {
    console.error('connect to %s error: ', config.url, err.message);
    process.exit(1);
  }
});

module.exports  = all({
  dirname: __dirname,
  filter: /(.+)\.js$/,
  recursive: true,
  map: function (name, path) {
    return name.toString()[0].toUpperCase() + name.toString().slice(1);
  }
});
