exports.validate = function (content){
  if (content) {
    content = badStrToJson(content);
    return function * (next){
      console.log(content);
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
  let strs = str.replace(/[:,{}]/g, '%').split('%');
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
