const {AppInfo, Codes} = require('../utils');
const {Subject, Activity, User} = require("../models");

module.exports = class test {
  constructor () {}

  //@route(get /test)
  * showTest () {
    let subjects = yield Subject.findOne();
    // subjects.forEach((e,i,a) => {
    //   a[i] = e.toObject();
    // });
    subjects = subjects.toObject();
    subjects.user = {test:"test"}
    this.body = AppInfo({test: subjects});
  }
};
