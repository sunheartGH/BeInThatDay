const mongoose = require('mongoose');
const User = mongoose.model("User");
const Follow = mongoose.model("Follow");


module.exports = class user {
  constructor () {}

  * addUser (body) {
    //注册时添加用户
  }

  * findById (userId) {
  }

  * findByVerify (username, password) {
    //查询某个用户的信息
  }

  * findByUsername (username) {
  }

  * updateUserFollows (userId) {
    //用户关注数
  }

  * updateUserFollowed (userId) {
    //用户被关注数
  }

  * updateUserFavors (userId) {
    //用户收藏数
  }
};
