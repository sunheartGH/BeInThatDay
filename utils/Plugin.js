const AppInfo = require("./AppInfo.js");

exports.errhandler = function (){
  return function * (next){
    if (this.state.error) {
      this.body = AppInfo.Msg(this.state.error.error, AppInfo.codes.WRONGPARAM);
      return;
    } else {
      yield next;
    }
  }
}

//playload:
// {
//     "iss": "John Wu JWT",
//     "iat": 1441593502,
//     "exp": 1441594722,
//     "aud": "www.example.com",
//     "sub": "jrocket@example.com",
//     "from_user": "B",
//     "target_user": "A"
// }
// iss: 该JWT的签发者
// sub: 该JWT所面向的用户
// aud: 接收该JWT的一方
// exp(expires): 什么时候过期，这里是一个 Unix时间戳 Math.round(new Date().getTime()/1000)
// iat(issued at): 在什么时候签发的
//header:
// {
//   "typ": "JWT",
//   "alg": "HS256"
// }
//typ: 类型JWT JSON WEB token
//alg: 签名算法 HS256: HMAC SHA-256
//验证失败应返回 HTTP 401 Unauthorized
exports.token = function (){
  return function * (next){
    //验证参数是否存在 var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
    //以点号分割字符串
    //判断长度为3
    //取 jwt header
    //取 header alg 取签名算法
    //取 jwt playload
    //取签名
    //取签名算法
    //对jwt header和playload进行签名
    //判断签名是否有效
    //判断时间是否过期
    //sub取用户邮箱
    //userId取用户id
    //查询数据库验证用户
    //附加到对象 this.token.userId this.token.email
    yield next;
  }
}
