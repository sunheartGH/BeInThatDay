let router = require('koa-router')(),
    dir = require('node-dir'),
    path = require('path'),
    CommentRouterPlugin = require('../utils/CommentRouterPlugin');
module.exports = router;

//匹配含有类似
////@route(get /a/b/:c)
////#validate({params:{day: Date}})
////#token({
//// user:NOTNULL
////})
//的内容
let reg = /((\/\/)|(\/\*\r\n){0,1}).*@route\(.*\)((\r\n.*\/\/.*)*|((\r\n.*)*(\*\/){1}))(\r\n.*){1}[^\/]\(.*\)/g;

//所有匹配的内容
let matchComments = [];

//读取所有非index.js的.js文件
dir.readFiles(__dirname, {match: /^(?![a-z0-9_.]*index)(.+)\.js$/}, function(err, content, next) {
  if (err) throw err;
  let fileComments = [];
  while(true) {
    let match = reg.exec(content);
    if (!match) break;
    fileComments.push(match[0])
  }
  //存储匹配内容
  matchComments.push(fileComments);
  next();
},function(err, files){
  if (err) throw err;
  processComments(files);
});

//处理所有匹配的路由和插件配置
function processComments(files) {
  for (let i = 0; i < files.length; i++) {
    //每一个.js文件导出的exports，都转换为对象
    let req = require(path.normalize(files[i]));
    if (!req) continue;
    if (typeof req === "function") {
      req = new req();
    }
    let comments = matchComments[i];
    for (let index in comments) {
      let comment = comments[index];
      //替换最后一个换行为#
      let lastEnterIndex = comment.lastIndexOf('\r\n')
      let firstStr = comment.slice(0, lastEnterIndex);
      let secondStr = comment.slice(lastEnterIndex);
      comment = firstStr + '#' + secondStr;
      let splitComments = comment.replace(/(\/\/)|(\r\n)|\s|(\/\*)|(\*\/)/g,'').split('#');
      //取第一个为route取最后一个为function
      let route = splitComments.shift().replace(/@route|\(|\)/g,'');
      let routeObj = {};
      let tmpRoute = route.slice(0, route.indexOf('/'));
      routeObj.method = tmpRoute?tmpRoute:'get';
      if(routeObj.method.indexOf('|')){
        routeObj.method = routeObj.method.split('|');
      }
      routeObj.path = route.slice(route.indexOf('/'), route.length);
      console.log('add router path: ' + routeObj.method + ' ' + routeObj.path);
      let fnName = splitComments.pop().replace(/function|module|exports|=|\.|:|\s|\*/g,"").match(/[a-zA-Z0-9_\$]+[^\s\(]/)[0];
      //解析插件信息
      let plugins = [];
      for (let oneIndex in splitComments) {
        let oneComment = splitComments[oneIndex];
        let pluginName = oneComment.slice(0, oneComment.indexOf('('));
        let pluginContent = oneComment.slice(oneComment.indexOf('(')+1, oneComment.lastIndexOf(')'));
        if(pluginName && pluginContent){
          plugins.push({pluginName: pluginName, pluginContent: pluginContent});
        }
      }
      let args = [];
      if (plugins.length > 0) {
        args.push(routeObj.path);
        for (let plgIndex in plugins) {
          let plugin = CommentRouterPlugin[plugins[plgIndex].pluginName];
          if(plugin && typeof plugin === "function"){
            console.log('add plugin: ' + plugins[plgIndex].pluginName);
            args.push(plugin(plugins[plgIndex].pluginContent));
          }
        }
        args.push(req[fnName]);
      } else {
        args.push(routeObj.path, req[fnName]);
      }
      if (req[fnName] && typeof req[fnName] === "function") {
        if(routeObj.method instanceof Array){
          for (let methodIndex in routeObj.method) {
            router[routeObj.method[methodIndex]](...args);
          }
        } else {
          router[routeObj.method](...args);;
        }
      }
    }
  }
  console.log('router OK');
}
