const {AppInfo, Codes, Schemas, Cryptos} = require('../utils');
const {User} = require('../models');


module.exports = class token {
  constructor () {}

  //@route(post /auth)
  * newToken () {
    let {username, email, phone, password} = this.request.body;
    //根据账号查找用户
    let accounts= {username: username, email: email, phone: phone};
    let user = yield User.findByAccount(accounts);
    if (user && user.id) {
      //加密密码
      let enpw = Cryptos.encryptPw(password, user.id);
      user = yield User.findByAccount(accounts, enpw);
      if (user) {
        //验证通过
        //TODO 若用户已有token_sign数据，发送消息提示
        //生成token
        let token = Cryptos.buildToken(user.id);
        //更新用户的token_sign数据
        let ts = token.split(".");
        //更新用户当前正在使用的token签名
        yield User.updateSet(user.id, {token_sign: ts[ts.length - 1]});
        //返回数据
        this.body = AppInfo({token: token});
      } else {
        this.body = AppInfo.Msg("account verify fail", Codes.Common.VERIFY_FAIL);
      }
    } else {
      this.body = AppInfo.Msg("account parameters not found", Codes.Common.ACCOUNT_NOTFOUND);
    }
    //将密码加密
  }

  //@route(get /token)
  * getToken () {
    //获取令牌信息/token验证
  }

  //@route(put /token)
  * updateToken () {
    //更新令牌信息
  }

  //@route(delete /token)
  * deleteToken () {
    //销毁令牌，登出
  }
};
