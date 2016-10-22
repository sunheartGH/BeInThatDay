//code: 参考 https://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81

function Msg(msg, code) {
  msg = msg || 'nothing found';
  code = code || 404;
  return {
    "meta": {
      "code": code,
      "status": "fail",
      "message": msg
    }
  };
}

function AppInfo (result) {
  return {
    "meta": {
      "code": 200,
      "status": "ok",
      "message": "success"
    },
    "result": result
  };
}

let codes = {
  OK: 200, //成功
  PARAMWRONG: 400, //参数错误
  NOTFOUND: 404, //未找到请求资源
  APPERROR: 501 //服务器异常
}

AppInfo.Msg = Msg;
AppInfo.NOFOUND = Msg('nothing found', codes.NOTFOUND);
AppInfo.APPERROR = Msg('serve occur error', codes.APPERROR);
AppInfo.WRONGID = Msg('wrong id', codes.PARAMWRONG);
AppInfo.WRONGPARAM = Msg('wrong params', codes.PARAMWRONG);


module.exports = AppInfo;

module.exports.codes = codes;
