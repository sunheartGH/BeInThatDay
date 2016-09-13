 let app = require('koa')(),
    logger = require('koa-logger'),
    validate = require('koa-validate'),
    router = require('./routes'),
    //routerCache = require('koa-router-cache'),
    bodyparser = require('koa-bodyparser'),
    staticCache = require('koa-static-cache'),
    session = require('koa-generic-session'),
    mongoStore = require('koa-generic-session-mongo'),
    //flash = require('koa-flash'),
    compress = require('koa-compress'),
    //render = require('co-ejs'),
    config = require('config-lite');

app.use(bodyparser());
app.use(staticCache(config.staticCacheConf));
app.use(logger());
app.keys = ["beinthatday"];
app.use(session({
  store: new mongoStore(config.mongodb)
}));
//app.use(flash());
//app.use(routerCache(app, config.routerCacheConf));
app.use(compress());
// app.use(render(app, config.renderConf));
validate(app);
// router = router(app);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(config.port, () => {
  console.log('Server listening on: ', config.port);
});
