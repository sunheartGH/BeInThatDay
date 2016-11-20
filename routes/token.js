const {AppInfo, Codes, Schemas, Cryptos} = require('../utils');
const {User} = require('../models');

module.exports = class token {
  constructor () {}

  //@route(post /token/auth)
  * newToken () {
    let {username, email, phone, password} = this.request.body;
    //根据账号查找用户
    let account= {username, email, phone};
    let user = yield User.findByAccount(account);
    if (user && user.id) {
      //加密密码
      let enpw = Cryptos.encryptPw(password, user.id);
      user = yield User.findByAccount(account, enpw);
      if (user) {
        //验证通过
        //TODO 若用户没有token代表正常，若已有token_sign数据代表不正常(重复登陆 或 抢占登录)
        //生成token
        let token = Cryptos.buildToken(user.id);
        //更新用户的token_sign数据
        let ts = token.split(".");
        //更新用户当前正在使用的token签名
        yield User.updateSetDoc(user.id, {token_sign: ts[ts.length - 1]});
        //返回数据
        this.body = AppInfo({token});
      } else {
        this.body = AppInfo.Msg("account verify fail", Codes.Common.VERIFY_FAIL);
      }
    } else {
      this.body = AppInfo.Msg("account parameters not found", Codes.Common.ACCOUNT_NOTFOUND);
    }
  }

  //@route(get /token)
  * showToken () {
    //获取令牌信息/token验证
  }

  //@route(put /token)
  * modifyToken () {
    //更新令牌信息
  }

  //@route(post /token/cancel)
  * cancelToken () {
    //销毁令牌，退出
  }
};
