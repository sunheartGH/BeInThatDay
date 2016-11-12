const {AppInfo, Codes, Schemas, Constants, Cryptos} = require('../utils');
const {User, Relation} = require("../models");

module.exports = class user {
  constructor () {}

  //@route(post /user)
  //#captcha()
  * newUser () {
    let {username, email, phone, password} = this.request.body;
    //创建用户
    let accounts= {username: username, email: email, phone: phone};
    let user = yield User.findByAccount(accounts); //验证用户是否重复
    if (user) {
      this.body = AppInfo.Msg("account is repeat", Codes.Common.REPEAT_ACCOUNT);
      return;
    } else {
      //以账号创建
      user = yield new User(accounts).save();
      let enpw = Cryptos.encryptPw(password, user.id); //加密密码
      yield User.updateSet(user.id, {password: enpw}); //更新密码
      //重定向到获取token
      this.status = 307;
      this.redirect("/auth");
    }
  }

  //@route(put /user/:id)
  * updateUserInfo () {
    //更新用户信息，修改用户昵称，头像， 标签，描述，主页等
  }

  //@route(put /user/:id/name)
  * updateUserName () {
    //更新用户信息，修改用户名
  }

  //@route(put /user/:id/email)
  * updateUserEmail () {
    //更新用户信息，修改用户邮箱
  }

  //@route(put /user/:id/pass)
  * updateUserPass () {
    //更新用户信息，修改用户密码
  }

  //@route(put /user/follow/:id)
  * userFollowUser () {
    //更新用户信息，用户关注id用户
    let userId = this.session.user;
    if (userId) {
      let followId = this.params.id;
      if (followId) {
        let result = yield Relation.saveRelation(userId, followId);
        if (result) {
          result = yield User.updateUserFollows(userId);
          if (result) {
            result = yield User.updateUserFollowed(followId);
          } else {
            this.body = 'update user follows has wrong';
          }
        } else {
          this.body = 'follow has wrong';
        }
      } else {
        this.body = "follow id is wrong";
      }
    } else {
      this.body = "must be login"
    }
  }

  //@route(get /user/:id)
  * queryById () {
    //获取id用户的信息
    let userId = this.params.id;
    if (userId) {
      let result = yield User.findById(userId);
      if (result) {
        this.body = result;
      } else {
        this.body = "user can't be find"
      }
    } else {
      this.body = "user id is wrong!"
    }
  }

  //@route(delete /user/:id)
  * deleteUser () {
    //删除id用户的信息 注销
  }
};
