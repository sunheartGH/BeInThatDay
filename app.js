 let https = require("https"),
  fs = require("fs"),
  app = require("koa")(),
  logger = require("koa-logger"),
  router = require("koa-router")(),
  statics = require("koa-static"),
  ckr = require("comment-koa-router"),
  //routerCache = require("koa-router-cache"),
  // staticCache = require("koa-static-cache"),
  bodyparser = require("koa-bodyparser"),
  // session = require("koa-generic-session"),
  // mongoStore = require("koa-generic-session-mongo"),
  //"koa-generic-session": "1.10.2",
  //"koa-generic-session-mongo": "0.2.5",
  compress = require("koa-compress"),
  config = require("config"),
  prehandle = require("./pres"),
  ckrPlugins = require("./utils/Plugins.js");

app.use(function* (next){
  console.log("  ip: ", this.ip, "↰");
  yield next;
});
app.use(logger());
app.use(bodyparser({
  enableTypes: ["json", "form", "text"],
  extendTypes: {
    text: ["application/xml", "text/xml", "text/*"]
  }
}));
// app.use(staticCache(config.staticCacheConf));
app.use(statics(config.staticsConf));
app.keys = ["beinthatday"];
// app.use(session({
//   store: new mongoStore(config.mongodb)
// }));
//app.use(routerCache(app, config.routerCacheConf));
app.use(compress());

//加载models
require("./models");

ckr(router, "./routes", {plugin: [prehandle, ckrPlugins], predir: "./pres"});
app.use(router.routes());
app.use(router.allowedMethods());

let options = {
  key: fs.readFileSync("./certs/server.key"),
  cert: fs.readFileSync("./certs/server.crt"),
  passphrase: "beinthatday"
}

https.createServer(options, app.callback()).listen(config.port, () => {
  console.log("Server listening on: ", config.port);
});
