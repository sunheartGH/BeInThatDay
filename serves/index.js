let all = require('require-all');

module.exports = all({
  dirname: __dirname,
  filter: /^(?!index)(.+)\.js$/,
  resolve: function (serve) {
    if ("function" === typeof serve) {
      let obj = new serve();
      obj.CLASS = serve;
      return obj;
    } else {
      return serve;
    }
  },
  recursive: true
});
