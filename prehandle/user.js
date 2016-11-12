const {AppInfo, Codes, Schemas, Constants} = require('../utils');
const validator = require('validator');

module.exports = class user {
  constructor () {}

  * newUser (next) {
    //注册新用户
    let {username, email, phone, password} = this.request.body;
    if (username || email || phone) { //验证账号存在
      if (username && (!Constants.usernameRgx.test(username) || Constants.sensitiveChars.indexOf()>=0)) { //验证用户名格式，和敏感字符
        this.body = AppInfo.Msg("wrong username format", Codes.User.USERNAME_DATA);
        return;
      }
      if (email && !validator.isEmail(email)) { //验证邮箱格式
        this.body = AppInfo.Msg("wrong email format", Codes.User.EMAIL_EXIST);
        return;
      }
      if (phone && !validator.isMobilePhone(phone, "zh-CN")) { //验证手机号
        this.body = AppInfo.Msg("wrong phone format", Codes.User.PHONE_EXIST);
        return;
      }
      if (password && Constants.passwordRgx.test(password)) { //验证密码存在
        //执行业务
        yield next;
      } else {
        this.body = AppInfo.Msg("password not exist", Codes.Common.NO_PASSWORD);
      }
    } else {
      this.body = AppInfo.Msg("no available account", Codes.Common.NO_ACCOUNT);
    }
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
