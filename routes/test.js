const {AppInfo, Codes} = require('../utils');
const {Subject, Activity, User} = require("../models");

module.exports = class test {
  constructor () {}

  //@route(get /test)
  * showTest () {
    let subjects = yield Subject.find();
    subjects.forEach((e,i,a) => {
      a[i] = e.toObject();
    });
    this.body = AppInfo({test: subjects});
  }
};
