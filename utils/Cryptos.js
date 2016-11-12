const crypto = require('crypto');
const moment = require('moment');

exports.encryptPw = function (pw, uid) {
  let k = "", fi = [2, 3, 5, 8, 13, 21];
  for (let f of fi) {k += uid[f];}
  if (k.length == fi.length) {
    k = crypto.createHmac('sha1', k)
      .update(pw.toString()).digest("base64");
  } else {k = ""}
  return k;
};


//header:
// {
//   "typ": "JWT",
//   "alg": "HS256"
// }
//typ: 类型 JWT JSON WEB token
//alg: 签名算法 HS256: HMAC SHA-256
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
const tokenAlg = "HS256";
const tokenType = "JWT";
const cipher = "beinthatday";
const iss = "beinthatday";
const alg = {"HS256": "sha256"};
const typ = {"JWT": "JWT"};
exports.buildToken = function (uid, body) {
  //创建jwt头 header
  let header = {"typ": tokenType,"alg": tokenAlg};
  //创建载荷 playload 设置发行方，持有方，过期时间，签发日期等
  let playload = {
    "iss": iss, //Issuer 证书发行方
    "exp": moment().add(1, 'months').toDate().getTime()/1000 | 0, //Expiration Time 到期时间
    "iat": moment().toDate().getTime()/1000 | 0, //Issued At 发证时间
    "aud": uid //Audience 证书持有人
  }
  Object.assign(playload, body);
  let token = new Buffer(JSON.stringify(header)).toString("base64") + "." + new Buffer(JSON.stringify(playload)).toString("base64");
  token += "." + crypto.createHmac(alg[tokenAlg], cipher).update(token).digest("base64");
  return token;
};

exports.parseToken = function (token) {
  if (token) {
    let ts = token.split(".");
    if (ts.length == 3) {
      let header = ts[0];
      let playload = ts[1];
      let sign = ts[2];
      //解析 header, playload
      try {
        header = JSON.parse(new Buffer(header, "base64").toString());
        playload = JSON.parse(new Buffer(playload, "base64").toString());
      } catch (err) {
        return;
      }
      if (header && playload && typ[header.typ] == tokenType && header.alg == tokenAlg && alg[header.alg]) {
        let en = crypto.createHmac(alg[tokenAlg], cipher).update(ts[0] + "." + ts[1]).digest("base64");
        //验证是否被修改过，判断是否到期，发行方是否正确
        if (sign == en && Number(playload.exp) > (moment().toDate().getTime()/1000 | 0) && playload.iss == iss) {
          return playload;
        }
      }
    }
  }
};
