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

exports.trimObject = function (obj){
  let param = {};
  if ( obj === null || obj === undefined || obj === "" ) return param;
  for (let key in obj ){
    if (toString.call(obj[key]) === "[object Object]"){
      param[key] = trimObject(obj[key]);
    }else if(obj[key] !== null && obj[key] !== undefined && obj[key] !== ""){
      param[key] = obj[key];
    }
  }
  return param;
};

exports.selectInDoc = function (doc, select){
  if (doc && toString.call(doc) == "[object Object]" && select) {
    select = flatten(select);
    for (let key in select) {
      if (key.indexOf(".") > 0) {
        _selectWalkStart(doc, select, key);
      } else {
        if (!select[key]) {
          delete doc[key];
        }
      }
    }
  }
};
exports.selectInDocs = function (docs, select){
  if (docs && toString.call(docs) == "[object Array]" && docs.length && select) {
    select = flatten(select);
    for (let doc of docs) {
      for (let key in select) {
        if (key.indexOf(".") > 0) {
          _selectWalkStart(doc, select, key);
        } else {
          if (!select[key]) {
            delete doc[key];
          }
        }
      }
    }
  }
};
function _selectWalkStart(doc, select, key) {
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
      if (!isNaN(ck) && obj[ck] && !select[key]) {
        delete obj[ck];
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
