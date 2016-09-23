//code:
// 1xx: 参数问题
// 2xx: 验证/权限问题
// 3xx: 服务器问题
function ErrGen(msg, code) {
  code = code || 101;
  return {error: code, message: msg};
}

function MsgGen(msg) {
  return {message: msg};
}

let codes = {
  PARAMWRONG: 101,
  APPERROR: 301
}

module.exports = {
  ErrGen: ErrGen,
  MsgGen: MsgGen,
  NOFOUND: MsgGen('Nothing Found'),
  APPERROR: ErrGen('App Occur Error', codes.APPERROR),
  WRONGID: ErrGen('The Id Is Wrong', codes.PARAMWRONG),
};

module.exports.codes = codes;
