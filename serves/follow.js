const mongoose = require('mongoose');
const Follow = mongoose.model("Follow");

module.exports = class user {
  constructor () {}

  * addFollow (user, followid) {
    //用户关注用户，创建条目
  }
};
