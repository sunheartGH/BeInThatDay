//code: 参考 https://zh.wikipedia.org/wiki/HTTP%E7%8A%B6%E6%80%81%E7%A0%81

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

function Msg(msg, code, status) {
  msg = msg || 'nothing found';
  code = code || 400;
  return {
    "meta": {
      "code": code,
      "status": status || "fail",
      "message": msg
    }
  };
}

AppInfo.Msg = Msg;

module.exports = AppInfo;
