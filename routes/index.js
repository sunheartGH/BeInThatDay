let router = require('koa-router')(),
    dir = require('node-dir'),
    path = require('path');
module.exports = router;

//匹配含有类似 ‘//route(get /a/b/:c)’ 的内容
let reg = /\/\/.*@route\(.*\)\r\n.*[^\/]\(.*\)/g;

//所有匹配的内容
let matchFiles = [];

//读取所有非index.js的.js文件
dir.readFiles(__dirname, {match: /^(?!index)(.+)\.js$/}, function(err, content, next) {
  if (err) throw err;
  let matchComments = [];
  while(true) {
    let match = reg.exec(content);
    if (!match) break;
    matchComments.push(match[0])
  }
  //存储匹配内容
  matchFiles.push(matchComments);
  next();
},function(err, files){
  if (err) throw err;
  processComments(files);
});

//处理所有匹配的路由配置
function processComments(files) {
  for (let i = 0; i < files.length; i++) {
    //每一个.js文件导出的exports，都转换为对象
    let req = require(path.normalize(files[i]));
    if (!req) continue;
    if (typeof req === "function") {
      req = new req();
    }
    let comments = matchFiles[i];
    for (let index in comments) {
      let comment = comments[index];
      //获取路由内容和方法名
      let routeAndFnName = comment.replace('\/\/@route','').split('\r\n');
      let route = routeAndFnName[0].match(/[^\(].+[^\s\)]/);
      let fnName = routeAndFnName[1].replace(/function|module|exports|=|\.|:|\s|\*/g,"").match(/[a-zA-Z0-9_\$]+[^\s\(]/)[0];
      let phm = getPathHttpMethod(route[0]);
      if (req[fnName] && typeof req[fnName] === "function") {
        //注册 访问路径，http方法，执行方法
        router.register(phm.path, phm.httpMethod, req[fnName]);
      }
    }
  }
}

//将类似 'httpMethod /path/pat/pa' 的字符串转成对象
function getPathHttpMethod(str) {
  let ks = str.split(' ');
  let httpMethod = [];
  let path;
  if (ks.length > 0) {
    if (ks.length == 1) {
      httpMethod.push("get");
      path = ks[0];
    } else {
      httpMethod = ks[0].split("|");
      path = ks[1];
    }
  }
  return {httpMethod: httpMethod, path: path};
}
