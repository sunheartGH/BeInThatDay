const actServe = require('../serves').act;
const AppInfo = require('../utils/AppInfo.js');


module.exports = class publiced {
  constructor () {}

  /*
  @route(get /public)
  #validate({
    $type:{
      q.de: Date,
      q.to: Date
    },
    $compare:[
      q.de - q.to > 2592000
    ]
  })
  #errhandler()
  */
  * queryPublic () {
    //查询public 日历，即所有的日历项中某月的每天最热/最新的日历项
    let {de, to} = this.query;
    let result = yield actServe.findActMonHot(de, to);
    if (result) {
      this.body = AppInfo(result);
    } else {
      this.body = AppInfo.Msg("query public acts occurs wrong", AppInfo.codes.NOTFOUND);
    }
  }

  /*
  @route(get /public/:day)
  #validate({
    $type:{
      p.day: Date,
      q.page: ?Number,
      q.size: ?Number,
      q.offset: ?Number,
      q.sort: ?[date, favor],
      q.order: ?[-1, 1]
    },
    $default:{
      q.page: 1,
      q.size: 10,
      q.offset: 0,
      q.sort: favor,
      q.order: 1
    }
  })
  #errhandler()
  */
  * queryPublicDay () {
    //查询public 某天的日历，page查询，最热排序/最新排序
    let day = this.params.day;

    let result = yield actServe.findActDayPage(day, this.query);
    if (result) {
      this.body = AppInfo(result);
    } else {
      this.body = AppInfo.Msg("query public day acts occurs wrong", AppInfo.codes.NOTFOUND);
    }
  }
};
