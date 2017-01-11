const {AppInfo, Codes, Schemas, Constants, Captcha} = require('../utils');
const validator = require('validator');

module.exports = class token {
  constructor () {}

  * newToken (next) {
    //先验证用户没有token
    if ((this.request.body&&this.request.body.token) ||
      (this.query&&this.query.token) ||
      (this.header&&this.header["x-access-token"])) {

      this.body = AppInfo.Msg("token already exists, will not created new token", Codes.Common.TOKEN_EXIST);
      return;
    }
    let {username, email, phone, password, captcha} = this.request.body;

    //验证码验证
    let captchaRes = yield Captcha.verifyCaptcha(captcha)
    if (!captchaRes) {
      this.body = AppInfo.Msg("captcha is wrong", Codes.Common.CAPTCHA_WRONG);
      return;
    }

    if (username || email || phone) { //验证账号存在
      if (username && !Constants.usernameRgx.test(username)) { //验证用户名格式
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
      if (password) { //验证密码存在
        //执行业务
        yield next;
      } else {
        this.body = AppInfo.Msg("password not exist", Codes.Common.NO_PASSWORD);
      }
    } else {
      this.body = AppInfo.Msg("no available account", Codes.Common.NO_ACCOUNT);
    }
  }

  * showToken (next) {
    yield next;
  }

  * refreshToken (next) {
    yield next;
  }

  * cancelToken (next) {
    yield next;
  }
};
