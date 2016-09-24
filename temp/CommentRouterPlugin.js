let math = require('mathjs');

exports.validate = function (content){
  if (content) {
    //类型校验方法
    let collect = {};
    function typeFunc(chunk, objKeys, method, val) {
      let collectkey = method + '.' +objKeys.join('.');
      method = method.replace('p', 'params').replace('q', 'query').replace('b', 'body');
      let obj = chunk
      for (let objKey in objKeys) {
        if(obj[objKeys[objKey]]) {
          obj = obj[objKeys[objKey]];
        } else {
          obj = null;
          break;
        }
      }
      if (obj) {
        let errorKeyWord = obj; //objKeys.join('.');
        val = val.replace('?', '');
        if (val == 'Date') { //日期
          let result = new Date(obj);
          if (result == 'Invalid Date') {
            return {error: method + ": " + errorKeyWord + " should be Date"};
          } else {
            obj = result.getTime();
          }
        } else if (val == 'Number'){ //数字
          if(isNaN(obj)) {
            return {error: method + ": " + errorKeyWord + " should be Number"};
          }
        } else if (val instanceof Array) { //数组
          if (val.indexOf(obj) < 0) {
            return {error: method + ": " + errorKeyWord + " should in " + val};
          }
        } else if (val.indexOf('/') >=0) { //正则
          if(!(new RegExp(val).test(obj))) {
            return {error: method + ": " + errorKeyWord + " should match " + val};
          }
        } else { //相等
          if (val != obj) {
            return {error: method + ": " + errorKeyWord + " should equal " + val};
          }
        }
      } else {
        if (val.indexOf('?') < 0) {
          return {error: method + ": " + objKeys.join('.') + " can't be null"};
        }
      }
      collect[collectkey] = obj;
    }

    content = badStrToJson(content);
    return function * (next){
      let types = content.$type;
      if (types) {
        for (let alias in types) {
          //区分 params, query 和 body
          let key = alias.replace('params', 'p').replace('query', 'q').replace('body', 'b');
          types[key] = types[alias];
          let val = types[key];
          let keys = key.split('.');
          let method = keys[0];
          let objKeys = keys.slice(1, keys.length);
          if (method == 'p') {
            let pres = typeFunc(this.params, objKeys, method, val);
            if(pres) {
              this.body = pres;
              return;
            } else {
              continue;
            }
          } else if (method == 'q') {
            let pres = typeFunc(this.query, objKeys, method, val);
            if(pres) {
              this.body = pres;
              return;
            } else {
              continue;
            }
          } else if (method == 'b') {
            let pres = typeFunc(this.body, objKeys, method, val);
            if(pres) {
              this.body = pres;
              return;
            } else {
              continue;
            }
          } else {
            throw Error('have wrong validate type config, please use p|q|b as key start')
          }
        }
      }
      let compares = content.$compare;
      if(compares) {
        for (let i in compares) {
          let express = compares[i].replace(/params/g, 'p').replace(/query/g, 'q').replace(/body/g, 'b');
          for (let key in collect) {
            if (key && collect[key]) {
              express = express.replace(new RegExp(key, 'g'), collect[key]);
            }
          }
          let evalRes = math.eval(express);
          console.log("evalRes: ");
          console.log(evalRes);
          if (!(evalRes)){
            this.body = {error: 'please confirm express ' + express + ' can be true'};
            return;
          }
        }
      }
      yield next;
    }
  } else {
    return function * (next){
      yield next;
    }
  }
}

exports.token = function (content){
  if (content) {
    content = badStrToJson(content);
    return function * (next){
      console.log('token: ');
      console.log(content);
      yield next;
    }
  } else {
    return function * (next){
      yield next;
    }
  }
}

function badStrToJson(str){
  let strs = str.replace(/[:,{}\[\]]/g, '%').split('%');
  let strings = []
  for (let i in strs) {
    if (strs[i]) {
      strings.push(strs[i]);
    }
  }
  for (let i in strings) {
    str = str.replace(strings[i], '%');
  }
  for (let i in strings) {
    str = str.replace('%', '"' + strings[i] + '"');
  }
  return JSON.parse(str);
}
