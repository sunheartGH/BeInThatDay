 let app = require('koa')(),
    logger = require('koa-logger'),
    validate = require('koa-validate'),
    router = require('koa-router')(),
    ckr = require('comment-koa-router'),
    //routerCache = require('koa-router-cache'),
    bodyparser = require('koa-bodyparser'),
    staticCache = require('koa-static-cache'),
    // session = require('koa-generic-session'),
    // mongoStore = require('koa-generic-session-mongo'),
    compress = require('koa-compress'),
    config = require('config-lite'),
    ckrPlugin = require('./utils/Plugin.js');

app.use(bodyparser());
app.use(staticCache(config.staticCacheConf));
app.use(logger());
app.keys = ["beinthatday"];
// app.use(session({
//   store: new mongoStore(config.mongodb)
// }));
//app.use(routerCache(app, config.routerCacheConf));
app.use(compress());
validate(app);

//加载models
require('./models');

ckr(router, './routes', {plugin: [ckrPlugin]});
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.port, () => {
  console.log('Server listening on: ', config.port);
});
