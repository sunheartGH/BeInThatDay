let User = require('../models').User,
    Follow = require('../models').Follow,
    mongoose = require('mongoose');


module.exports = class user {
  constructor () {}

  * addUser (body) {
    //注册时添加用户
    let userEntity = new User(body);
    let result = yield userEntity.save();
    return result;
  }

  * findById (userId) {
    let result = yield User.findOne({"_id": userId});
    return result;
  }

  * findByVerify (username, password) {
    //查询某个用户的信息
    let result = yield User.findOne({"username": username, "password": password});
    return result;
  }

  * findByUsername (username) {
    let result = yield User.findOne({"username": username});
    return result;
  }

  * updateUserFollows (userId) {
    //用户关注数
    let result = yield User.update({_id: userId}, {$inc: {'follows': 1}});
    return result;
  }

  * updateUserFollowed (userId) {
    //用户被关注数
    let result = yield User.update({_id: userId}, {$inc: {'followed': 1}});
    return result;
  }

  * updateUserFavors (userId) {
    //用户收藏数
    let result = yield User.update({_id: userId}, {$inc: {'favors': 1}});
    return result;
  }
};
