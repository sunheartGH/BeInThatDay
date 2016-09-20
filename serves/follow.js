let Follow = require('../models').Follow,
    mongoose = require('mongoose');


module.exports = class user {
  constructor () {}

  * addFollow (user, followid) {
    //用户关注用户，创建条目
    let follow = new Follow({user: user, follow: mongoose.Types.ObjectId(followid)});
    let result = yield follow.save();
    return result;
  }
};
