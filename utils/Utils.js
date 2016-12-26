const AppInfo = require('./AppInfo.js');
const Codes = require('./Codes');
const validator = require('validator');

exports.validPageTime = function (body) {
  if (body) {
    let {page, size, lastime, firstime} = body;
    if (page && (isNaN(page) || page < 0 || page%1 > 0)) {
      return AppInfo.Msg("page should be positive integer", Codes.Common.PAGETIME_PAGE_WRONG);
    }
    if (size && (isNaN(size) || size < 0 || size%1 > 0)) {
      return AppInfo.Msg("size should be positive integer", Codes.Common.PAGETIME_SIZE_WRONG);
    }
    if (lastime && !validator.isDate(lastime)) {
      return AppInfo.Msg("lastime should be date", Codes.Common.PAGETIME_LASTIME_WRONG);
    }
    if (firstime && !validator.isDate(firstime)) {
      return AppInfo.Msg("firstime should be date", Codes.Common.PAGETIME_FIRSTIME_WRONG);
    }
  }
};

exports.havePageTime = function (body, str) {
  if (body) {
    if (str) {
      if (Array.isArray(str)) {
        for (let s of str) {
          if (!body[s]) {
            return false;
          }
        }
      } else if (body[str]) {
        return true;
      }
    } else if (body.lastime || body.firstime || body.page || body.size) {
      return true;
    }
  }
}

exports.parsePageTime = function (body) {
  if (body) {
    let {page, size, lastime, firstime} = body;
    page = Number(page) || 1;
    if (size) {
      size = size > 20 ? 20 : Number(size);
    } else {
      size = 10;
    }
    if (lastime) {
      lastime = new Date(lastime);
    } else {
      lastime = new Date();
    }
    if (firstime) {
      firstime = new Date(firstime);
    }
    return {page, size, offset: (page - 1)*size, lastime, firstime}
  }
};

exports.parseUserId = function (body) {
  if (body) {
    let {uid, userid, userId, user_id, user_Id, UserId, u_id, uId, u_Id,  User_Id} = body;
    return uid || userid || userId || user_id || user_Id || UserId || u_id || uId || u_Id || User_Id;
  }
};

exports.trimed = function trimed(obj){
  let param;
  if ( obj === null || obj === undefined || obj === "" ) return param;
  if (toString.call(obj) === "[object Object]") {
    param = {};
    for (let key in obj ){
      if(obj[key] !== null && obj[key] !== undefined && obj[key] !== ""){
        param[key] = trimed(obj[key]);
      }
    }
  } else if (toString.call(obj) === "[object Array]") {
    param = [];
    for (let key in obj ){
      if(obj[key] !== null && obj[key] !== undefined && obj[key] !== ""){
        param.push(trimed(obj[key]));
      }
    }
  } else {
    param = obj;
    if (typeof param == "string") {
      param = param.trim();
    }
  }
  return param;
};

exports.selected = function (doc, select){
  if (doc && select) {
    let sflat = flatten(select);
    let fval = sflat[Object.keys(sflat)[0]];
    if (fval) { //表示为执行收集操作
      if (toString.call(doc) == "[object Object]") {
        _collectWalkStart(doc, select);
      } else if (toString.call(doc) == "[object Array]" && doc.length) {
        for (let d of doc) {
          _collectWalkStart(d, select);
        }
      }
    } else {//表示为执行删除操作
      select = sflat;
      if (toString.call(doc) == "[object Object]") {
        for (let key in select) {
          if (key.indexOf(".") > 0) {
            _deleteWalkStart(doc, select, key);
          } else {
            if (!select[key]) {
              delete doc[key];
            }
          }
        }
      } else if (toString.call(doc) == "[object Array]" && doc.length) {
        for (let d of doc) {
          for (let key in select) {
            if (key.indexOf(".") > 0) {
              _deleteWalkStart(d, select, key);
            } else {
              if (!select[key]) {
                delete d[key];
              }
            }
          }
        }
      }
    }
  }
};

function _collectWalkStart(doc, select) {
  function walk (o, s) {
    for (let k in o){
      if (s[k]) {
        if (toString.call(o[k]) == "[object Array]" &&
          isNaN(s[k]) &&
          isNaN(Object.keys(s[k])[0])) {

          for (let _o of o[k]) {
            walk(_o, s[k]);
          }
        } else {
          if (isNaN(s[k])) {
            walk(o[k], s[k]);
          }
        }
      } else {
        delete o[k];
      }
    }
  }
  walk(doc, select);
}

function _deleteWalkStart(doc, select, key) {
  let ks = key.split(".");
  let i = 0;
  function walk (obj, ck) {
    if (toString.call(obj) == "[object Object]") {
      if (i == ks.length - 1 && obj && ck && !select[key]) {
        delete obj[ck];
      } else {
        i++;
        walk(obj[ck], ks[i]);
      }
    } else if (toString.call(obj) == "[object Array]") {
      if (!isNaN(ck)) {
        if (i == ks.length - 1 && obj[ck] && !select[key]) {
          delete obj[ck];
        } else {
          i++;
          walk(obj[ck], ks[i]);
        }
      } else {
        for (let o of obj) {
          walk(o, ks[i]);
        }
      }
    }
  }
  walk(doc, ks[i]);
}

function flatten (data) {
  let result = {};
  function recurse (cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for(let i=0, l=cur.length; i<l; i++){
        recurse(cur[i], prop + "[" + i + "]");
      }
      if (l == 0) result[prop] = [];
    } else {
      let isEmpty = true;
      for (let p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop+"."+p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
}
exports.flatten = flatten;

function unflatten(data) {
  if (Object(data) !== data || Array.isArray(data))
    return data;
  let regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
    resultholder = {};
  for (let p in data) {
    let cur = resultholder,
      prop = "",
      m;
    while (m = regex.exec(p)) {
      cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
      prop = m[2] || m[1];
    }
    cur[prop] = data[p];
  }
  return resultholder[""] || resultholder;
};
exports.unflatten = unflatten;
