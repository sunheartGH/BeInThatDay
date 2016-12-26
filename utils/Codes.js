//30x-33x代表TOKEN，账户和权限验证问题
//36x代表分页数据验证
//37x-39x代表其他数据问题
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
  USER_NOTFOUND: 321, //用户未找到
  USER_SELF_WRONG: 322, //用户不能对自己进行此操作
  PERMISSION_FORBID: 330, //用户权限禁止，即用户没有进行此操作的权限

  PAGETIME_PAGE_WRONG: 361, //分页 page 参数格式/数据错误
  PAGETIME_SIZE_WRONG: 362, //分页 size 参数格式/数据错误
  PAGETIME_LASTIME_WRONG: 363, //分页 lastime 参数格式/数据错误
  PAGETIME_FIRSTIME_WRONG: 364, //分页 firstime 参数格式/数据错误

  DATE_WRONG: 371, //日期数据错误

  REPEAT_WRONG: 381, //数据重复错误，即数据不应该重复

  DB_FAIL: 391, //数据库操作失败

  PARAM_NULL: 401,
  PARAM_TYPE: 501,
  PARAM_DATA: 601,
  PARAM_FOUND: 701,
};

const models = require('../models');
//Model代号 类型代号 字段代号
//4xxxx代表参数为空
//5xxxx代表参数格式错误
//6xxxx代表参数数据错误
//7xxxx代表参数对应数据未找到
let mi = 0;
for (let key in models) {
  let model = models[key];
  if (model) {
    let paths = [];
    let schema = model.schema;
    if (schema) {
      schema.eachPath((path) => {
        paths.push(path.toUpperCase());
      });
      mi++;
      exports[model.modelName] = arr2obj(paths, mi);
    }
  }
}

function arr2obj (arr, num) {
  let seqObj = {};
  for (let i in arr) {
    let numstr = num+'';
    let nl = numstr.length
    let istr = (1*i+1)+'';
    let il = istr.length;
    if (il>nl) {
      numstr = Array(il-nl+1).join("0") + numstr;
    } else if (nl>il) {
      istr = Array(nl-il+1).join("0") + istr;
    }
    if (numstr.length ==1) {
      numstr = "0"+numstr;
    }
    if (istr.length ==1) {
      istr = "0"+istr;
    }
    let one = arr[i];
    let one_null = one + "_NULL";
    let one_type = one + "_TYPE";
    let one_data = one + "_DATA";
    let one_found = one + "_FOUND";
    seqObj[one_null] = Number(4 + numstr + istr);
    seqObj[one_type] = Number(5 + numstr + istr);
    seqObj[one_data] = Number(6 + numstr + istr);
    seqObj[one_found] = Number(7 + numstr + istr);
  }
  return seqObj;
}
