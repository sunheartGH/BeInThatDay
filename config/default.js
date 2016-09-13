let path = require('path');

module.exports = {
  port: process.env.PORT || 3000,
  mongodb: {
    url: 'mongodb://127.0.0.1:27017/work'
  },
  staticCacheConf: path.join(__dirname, '../public'),
  renderConf: path.join(__dirname, '../view/config'),
  routerCacheConf: {
    '/': {
      expire: 10 * 1000,
      condition: function() {
        return !this.session || !this.session.user;
      }
    }
  }
};
