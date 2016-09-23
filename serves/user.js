let User = require('../models').User,
    Follow = require('../models').Follow,
    mongoose = require('mongoose');


module.exports = class user {
  constructor () {}

  * addUser (body) {
    //注册时添加用户
    let userEntity = new User(body);
    return yield userEntity.save();
  }

  * findById (userId) {
    return yield User.findOne({"_id": userId});
  }

  * findByVerify (username, password) {
    //查询某个用户的信息
    return yield User.findOne({"username": username, "password": password});
  }

  * findByUsername (username) {
    return yield User.findOne({"username": username});
  }

  * updateUserFollows (userId) {
    //用户关注数
    return yield User.update({_id: userId}, {$inc: {'follows': 1}});
  }

  * updateUserFollowed (userId) {
    //用户被关注数
    return yield User.update({_id: userId}, {$inc: {'followed': 1}});
  }

  * updateUserFavors (userId) {
    //用户收藏数
    return yield User.update({_id: userId}, {$inc: {'favors': 1}});
  }
};
