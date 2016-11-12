//3xx代表TOKEN和账户验证
//4xx代表参数为空
//5xx代表参数格式错误
//6xx代表参数数据错误
//7xx代表参数对应数据未找到

const models = require('../models');

exports.Common = {
  NO_TOKEN: 301, //请求参数不存在token
  WRONG_TOKEN: 302, //token 错误
  TOKEN_EXIST: 303, //请求参数已存在token
  TOKEN_PAST: 304, //token过旧
  NO_ACCOUNT: 311, //账号参数不存在
  NO_PASSWORD: 312, //密码参数不存在
  ACCOUNT_NOTFOUND: 313, //账号参数(在数据库中)未找到
  REPEAT_ACCOUNT: 314, //账号参数(在数据库中)未找到
  VERIFY_FAIL: 315, //账户验证失败
  USER_NOTFOUND: 321 //用户未找到
};

for (let key in models) {
  let model = models[key];
  if (model) {
    let paths = [];
    let schema = model.schema;
    if (schema) {
      schema.eachPath(function(path) {
        paths.push(path.toUpperCase());
      });
      exports[model.modelName] = arr2obj(paths);
    }
  }
}

function arr2obj (arr) {
  let seqObj = {};
  for (let i in arr) {
    let one = arr[i];
    let one_null = one + "_NULL";
    let one_format = one + "_TYPE";
    let one_data = one + "_DATA";
    let one_found = one + "_FOUND";
    seqObj[one_null] = (401 + Number(i));
    seqObj[one_format] = (501 + Number(i));
    seqObj[one_data] = (601 + Number(i));
    seqObj[one_found] = (701 + Number(i));
  }
  return seqObj;
}
