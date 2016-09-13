const User = require('../models').User;

module.exports = class user {
  constructor () {}

  * addUser () {
    //注册时添加用户
    let userEntity = new User(this.request.body);
    let result = yield userEntity.save();
    return result;
  }

  * findByUnPw () {
    //查询某个用户的信息
    let {username, password} = this.request.body;
    let result = yield User.findOne({"username": username, "password": password});
    return result;
  }

  * findByUsername () {
    let username = this.params.username;
    let result = yield User.findOne({"username": username});
    return result;
  }

  * updateUserFollow () {
    //用户被关注
  }

  * updateUserComment () {
    //用户评论，关联用户和comment的关系
  }

  * updateUserSubFavor () {
    //用户收藏sub，关联sub和user,
  }
};
