const {AppInfo, Codes, Cryptos} = require("../utils");
const {User} = require('../models');

exports.error = function (){
  return function* (next){
    if (this.state.error) {
      this.body = AppInfo.Msg(this.state.error.error);
      return;
    } else {
      yield next;
    }
  }
}

exports.token = function (){
  return function* (next){
    //验证参数是否存在
    let token = (this.request.body&&this.request.body.token) ||
      (this.query&&this.query.token) ||
      (this.header&&this.header["x-access-token"]);

    if (!token) {
      this.body = AppInfo.Msg("no token", Codes.Common.NO_TOKEN);
      return;
    }
    let pl = Cryptos.parseToken(token);
    if (pl) {
      let user = yield User.findById(pl.aud);
      if (user) {
        //验证用户当前正在使用的token
        if (user.token_sign == token.slice(token.lastIndexOf(".")+1, token.length)) {
          console.log("operater: ", '\x1b[32m' , user.id);
          this.state.user = user;
        } else {
          this.body = AppInfo.Msg("token has past", Codes.Common.TOKEN_PAST);
          return;
        }
      } else {
        this.body = AppInfo.Msg("token can't correspond to user", Codes.Common.USER_NOTFOUND);
        return;
      }
    } else {
      this.body = AppInfo.Msg("wrong token", Codes.Common.WRONG_TOKEN);
      return;
    }
    yield next;
  }
}

exports.captcha = function (){
  return function* (next){
    console.log("captcha validate");
    yield next;
  }
}
