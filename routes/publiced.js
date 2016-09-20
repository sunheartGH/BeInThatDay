let actServe = require('../serves').act;

const pageRgx = /^[1-9]+0*$/;
const sizeRgx = /^[1-5]0?$/;
const offsetRgx = /^[0-9]+$/;
const orderObj = {desc: -1, asc: 1};
const sortRgx = /date|favor/;

module.exports = class publiced {
  constructor () {}

  //@route(get /public)
  * queryPublic () {
    //查询public 日历，即所有的日历项中某月的每天最热/最新的日历项
    let {de, to} = this.query;
    if (de && to) {
      let result = yield actServe.findActMonHot(de, to);
      if (result) {
        this.body = result;
      } else {
        this.body = "query public acts occurs wrong";
      }
    } else {
      this.body = "de and to is none";
    }
  }

  //@route(get /public/:day)
  * queryPublicDay () {
    //查询public 某天的日历，page查询，最热排序/最新排序
    let day = this.params.day;
    if (day) { //判断day的格式
      let {page, size, offset, sort, order} = this.query;
      this.query.page = pageRgx.test(page) ? Number(page) : 1;
      this.query.size = sizeRgx.test(size) ? Number(size) : 10;
      this.query.offset = offsetRgx.test(offset) ? Number(offset) : 0;
      sort = sortRgx.test(sort) ? sort : 'favor';
      order = order in orderObj ? order : 'asc';
      this.query.order = orderObj[order];
      let sortObj = {};
      sortObj[sort] = order;
      this.query.sort = sortObj;

      let result = yield actServe.findActDayPage(day, this.query);
      if (result) {
        this.body = result;
      } else {
        this.body = "query public day acts occurs wrong";
      }
    } else {
      this.body = "day wrong format";
    }
  }
};
