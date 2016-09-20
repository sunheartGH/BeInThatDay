let userClass = require('./user');

module.exports = class token {
  constructor () {}

  //@route(post /token)
  * newToken () {
    //创建新的令牌，先验证用户数据，然后创建令牌，生成token/session并返回完成登陆
    if (this.session.user) {
      this.body = "user has logon";
      return;
    }

    //用户登陆时验证方法，验证登陆参数，用户名/邮箱，密码(做处理)是否合法，是否有效
    let {username, password} = this.request.body;
    if (username && password) {
      let result = yield userServe.findByVerify(username, password);
      if (result) {
        this.session.user = result["_id"];
        this.body = "login is ok";
      } else {
        this.body = "username or password is wrong";
      }
    } else {
      this.body = "username or password is none";
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
