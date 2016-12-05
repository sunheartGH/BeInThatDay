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

  * showUser (next) {
    //uid 格式判断
    let {uid} = this.params;

    if (!Schemas.ObjectIdValid(uid)) {
      this.body = AppInfo.Msg("user id must be objectid string", Codes.User._ID_DATA);
      return;
    }

    yield next;
  }

  * modifyUser (next) {
    //TODO 修改参格式数判断
    yield next;
  }
};
