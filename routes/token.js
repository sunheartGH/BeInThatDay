const userClass = require('./user');

module.exports = class token {
  constructor () {}

  //@route(post /token)
  * newToken () {
    //创建新的令牌，先验证用户数据，然后创建令牌，生成token/session并返回完成登陆
    if (this.session.user) {
      this.body = "user has logon";
      return;
    }
    let user = new userClass();
    let validResult = yield user.userVerify;
    //验证成功，设置session
    if (validResult.valid) {
      this.session.user = validResult.result;
      this.body = "login is ok";
    } else {
      this.body = validResult.result;
    }
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
