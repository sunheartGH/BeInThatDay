
module.exports = class token {
  constructor () {}

  /*
  @route(post /token)
  #validate({
    $type:{
      b.username: -b.email,
      b.password: !Null,
      b.access_token: Null,
      q.access_token: Null,
      h.x-access-token: Null
    }
  })
  */
  * newToken () {
    //先验证用户没有token

    //验证请求用户名/邮箱，密码
    //若验证成功，生成token
    //创建jwt header {"typ": "JWT","alg": "HS256"} 取配置的签名算法
    //创建载荷palyload sub用户邮箱userId用户id，设置过期时间，签发日期等
    //base64 header
    //base64 palyload
    //以.拼接header和playload
    //对拼接后的结果进行签名
    //拼接签名
    //返回签名
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
