const {AppInfo, Codes} = require('../utils');

module.exports = class test {
  constructor () {}

  //@route(get /test)
  * showTest () {
    this.body = AppInfo({test: this.headers});
  }
};
