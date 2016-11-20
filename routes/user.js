const {AppInfo, Codes, Schemas, Constants, Cryptos} = require('../utils');
const {User, Relation} = require("../models");

module.exports = class user {
  constructor () {}

  //@route(post /user)
  //#captcha()
  * newUser () {
    let {username, email, phone, password} = this.request.body;
    //创建用户
    let account= {username, email, phone};
    let user = yield User.findByAccount(account); //验证用户是否重复
    if (user) {
      //已账号创建
      this.body = AppInfo.Msg("account is repeat", Codes.Common.REPEAT_ACCOUNT);
      return;
    } else {
      //添加新的用户
      user = yield User.saveDoc(account);
      let enpw = Cryptos.encryptPw(password, user.id); //加密密码
      yield User.updateSetDoc(user.id, {password: enpw}); //更新密码
      //重定向到获取token
      this.status = 307;
      this.redirect("/auth");
    }
  }

};
