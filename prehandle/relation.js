const mongoose = require('mongoose');
const Relation = mongoose.model("Relation");

module.exports = class user {
  constructor () {}

  * addFollow (user, followid) {
    //用户关注用户，创建条目
  }
};
