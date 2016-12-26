const {AppInfo, Codes, Schemas, Utils, Constants} = require('../utils');
const {Activity, Subject} = require('../models');
const validator = require('validator');
//参数验证:

module.exports = class activity {
  constructor () {}

  * newActivity (next) {
    //添加activity
    let {title, cover_picurl, summary,
      content, site, start_time, end_time,
      fee, location, tags, expose_level} = this.request.body;


    let validMsg = Schemas.ValidTypeToMsg(`title, cover_picurl,
      summary, content, start_time, end_time`,
      Activity, this.request.body);

    this.request.body.title = title.trim();
    this.request.body.summary = summary.trim();
    this.request.body.content = content.trim();

    if (validMsg) {
      this.body = validMsg;
      return;
    }

    if (title.length < 4 || title.length > 128) {
      this.body = AppInfo.Msg("title length is unlegal", Codes.Activity.TITLE_DATA);
      return;
    }

    if (summary.length < 16 || summary.length > 256) {
      this.body = AppInfo.Msg("summary length is unlegal", Codes.Activity.SUMMARY_DATA);
      return;
    }

    if (content.length < 16) {
      this.body = AppInfo.Msg("content length is unlegal", Codes.Activity.CONTENT_DATA);
      return;
    }

    //判断end_time > start_time
    let newDate = new Date();
    start_time = new Date(start_time);
    end_time = new Date(end_time)
    if (start_time.getTime() <= newDate.getTime()) {
      this.body = AppInfo.Msg("start_time must greater than now", Codes.Activity.START_TIME_DATA);
      return;
    }
    if (start_time.getTime() >= end_time.getTime()) {
      this.body = AppInfo.Msg("end_time must greater than start_time", Codes.Activity.END_TIME_DATA);
      return;
    }
    this.request.body.start_time = start_time;
    this.request.body.end_time = end_time;

    //cover_picurl, site 为url
    if (!validator.isURL(cover_picurl)) {
      this.body = AppInfo.Msg("cover_picurl must be url", Codes.Activity.COVER_PICURL_DATA);
      return;
    }
    if (site && !validator.isURL(site)) {
      this.body = AppInfo.Msg("site must be url", Codes.Activity.SITE_DATA);
      return;
    }
    //fee 大于0
    if (fee) {
      let feeValidMsg = Schemas.ValidTypeToMsg(`fee`, Activity, this.request.body);
      if (feeValidMsg) {
        this.body = feeValidMsg;
        return;
      }
      if (fee < 0) {
        this.body = AppInfo.Msg("fee must be greater than zero", Codes.Activity.FEE_DATA);
        return;
      }
    }
    //location
    if (location) {
      let locationValidMsg = Schemas.ValidTypeToMsg(`location`, Activity, this.request.body);
      if (locationValidMsg) {
        this.body = locationValidMsg;
        return;
      }
    }
    //tags
    if (tags) {
      if (!Array.isArray(tags)) {
        this.body = AppInfo.Msg("tags should be Array type", Codes.Activity.TAGS_TYPE);
        return;
      }
      if (!tags.length) {
        this.body = AppInfo.Msg("tags length is unlegal", Codes.Activity.TAGS_DATA);
        return;
      }
      for (let tag of tags) {
        if (!Schemas.ObjectIdValid(tag)) {
          this.body = AppInfo.Msg("tags elements must be objectid string", Codes.Activity.TAGS_DATA);
          return;
        }
      }
    }

    //expose_level 存在
    if (expose_level && !Constants.ExposeLevel[expose_level]) {
      this.body = AppInfo.Msg("wrong expose_level", Codes.Subject.EXPOSE_LEVEL_DATA);
      return;
    }

    yield next;
  }

  * showActivity (next) {
    //subid参数格式判断
    let {subid} = this.params;
    if (!Schemas.ObjectIdValid(subid)) {
      this.body = AppInfo.Msg("query id must be objectid string", Codes.Subject._ID_DATA);
      return;
    }
    yield next
  }

  * showActivityContent (next) {
    //subid参数格式判断
    let {subid} = this.params;
    if (!Schemas.ObjectIdValid(subid)) {
      this.body = AppInfo.Msg("query id must be objectid string", Codes.Subject._ID_DATA);
      return;
    }
    yield next
  }

  * showActivitys (next) {
    //分页查询判断
    let validMsg = Utils.validPageTime(this.query);
    if (validMsg) {
      this.body = validMsg;
      return;
    }
    //userid参数格式判断
    let uid = Utils.parseUserId(this.query);
    if (uid) {
      if (!Schemas.ObjectIdValid(uid)) {
        this.body = AppInfo.Msg("query id must be objectid string", Codes.Activity.CREATER_DATA);
        return;
      }
    }

    let city = this.query.city;
    if (city) {
      if (typeof city != "string") {
        this.body = AppInfo.Msg("city must be string", Codes.Common.PARAM_TYPE);
        return;
      }
      if (city.length < 2 || city.length > 32) {
        this.body = AppInfo.Msg("city length is illegal", Codes.Common.PARAM_DATA);
        return;
      }
    }
    yield next;
  }

  * showActivitysCalendar (next) {
    //userid参数格式判断
    let uid = Utils.parseUserId(this.query);
    if (uid) {
      if (!Schemas.ObjectIdValid(uid)) {
        this.body = AppInfo.Msg("query id must be objectid string", Codes.Activity.CREATER_DATA);
        return;
      }
    }
    let {from, until} = this.query;
    if (!from || !until || typeof from != "string" || typeof until != "string") {
      this.body = AppInfo.Msg("from and until date parameter wrong type", Codes.Common.DATE_WRONG);
      return;
    }
    if (validator.isDate(from||"") && validator.isDate(until||"")) {
      this.query.from = new Date(from);
      this.query.until = new Date(until);
    } else {
      this.body = AppInfo.Msg("from and until date parameter wrong", Codes.Common.DATE_WRONG);
      return;
    }

    let city = this.query.city;
    if (city) {
      if (typeof city != "string") {
        this.body = AppInfo.Msg("city must be string", Codes.Common.PARAM_TYPE);
        return;
      }
      if (city.length < 2 || city.length > 32) {
        this.body = AppInfo.Msg("city length is illegal", Codes.Common.PARAM_DATA);
        return;
      }
    }

    yield next;
  }

  * showUserActivitys(next) {
    let {uid} = this.params;
    if (!Schemas.ObjectIdValid(uid)) {
      this.body = AppInfo.Msg("userid must be objectid string", Codes.Activity.CREATER_DATA);
      return;
    }
    yield next;
  }

  * favoriteActivity (next) {
    //subid格式判断
    let {subid} = this.params;
    if (!Schemas.ObjectIdValid(subid)) {
      this.body = AppInfo.Msg("query id must be objectid string", Codes.Subject._ID_DATA);
      return;
    }
    yield next
  }

  * modifyActivity (next) {
    //要修改的数据格式判断
    let {subid} = this.params;
    let {title, cover_picurl, summary, content, site, start_time,
      end_time, fee, tags, expose_level, location} = this.request.body;

    //subid格式判断
    if (!Schemas.ObjectIdValid(subid)) {
      this.body = AppInfo.Msg("query id must be objectid string", Codes.Subject._ID_DATA);
      return;
    }
    //title 数据与长度判断
    if (title) {
      this.request.body.title = title.trim();
      if (typeof title != "string") {
        this.body = AppInfo.Msg("title must be string", Codes.Activity.TITLE_TYPE);
        return;
      }
      if (title.length < 4 || title.length > 128) {
        this.body = AppInfo.Msg("title length is unlegal", Codes.Activity.TITLE_DATA);
        return;
      }
    }
    if (summary) {
      this.request.body.summary = summary.trim();
      if (typeof summary != "string") {
        this.body = AppInfo.Msg("summary must be string", Codes.Activity.SUMMARY_TYPE);
        return;
      }
      if (summary.length < 16 || summary.length > 256) {
        this.body = AppInfo.Msg("summary length is unlegal", Codes.Activity.SUMMARY_DATA);
        return;
      }
    }
    //content 数据与长度判断
    if (content) {
      this.request.body.content = content.trim();
      if (typeof content != "string") {
        this.body = AppInfo.Msg("content must be string", Codes.Activity.CONTENT_TYPE);
        return;
      }
      if (content.length < 16) {
        this.body = AppInfo.Msg("content length is unlegal", Codes.Activity.CONTENT_DATA);
        return;
      }
    }
    //判断 end_time, start_time
    if (start_time) {
      if (typeof start_time != 'string') {
        this.body = AppInfo.Msg("start_time date parameter wrong type", Codes.Common.DATE_WRONG);
        return;
      }
      if (!validator.isDate(start_time)) {
        this.body = AppInfo.Msg("start_time date parameter wrong", Codes.Common.DATE_WRONG);
        return;
      }
      start_time = new Date(start_time);
      let newDate = new Date();
      if (start_time.getTime() <= newDate.getTime()) {
        this.body = AppInfo.Msg("start_time must greater than now", Codes.Activity.START_TIME_DATA);
        return;
      }
      this.request.body.start_time = start_time;
    }
    if (end_time) {
      if (typeof end_time != 'string') {
        this.body = AppInfo.Msg("end_time date parameter wrong type", Codes.Common.DATE_WRONG);
        return;
      }
      if (!validator.isDate(end_time)) {
        this.body = AppInfo.Msg("end_time date parameter wrong", Codes.Common.DATE_WRONG);
        return;
      }
      end_time = new Date(end_time);
      let newDate = new Date();
      if (end_time.getTime() <=  newDate.getTime()) {
        this.body = AppInfo.Msg("end_time must greater than now", Codes.Activity.END_TIME_DATA);
        return;
      }
      this.request.body.end_time = end_time;
      console.log("update");
      console.log(end_time.toISOString());
    }

    //cover_picurl, site 为url
    if (cover_picurl && (typeof cover_picurl != 'string' || !validator.isURL(cover_picurl))) {
      this.body = AppInfo.Msg("cover_picurl must be url", Codes.Activity.COVER_PICURL_DATA);
      return;
    }
    if (site && (typeof site != 'string' || !validator.isURL(site))) {
      this.body = AppInfo.Msg("site must be url", Codes.Activity.SITE_DATA);
      return;
    }
    //fee 大于0
    if (fee) {
      let feeValidMsg = Schemas.ValidTypeToMsg(`fee`, Activity, this.request.body);
      if (feeValidMsg) {
        this.body = feeValidMsg;
        return;
      }
      if (fee < 0) {
        this.body = AppInfo.Msg("fee must be greater than zero", Codes.Activity.FEE_DATA);
        return;
      }
    }
    //location
    if (location) {
      let locationValidMsg = Schemas.ValidTypeToMsg(`location`, Activity, this.request.body);
      if (locationValidMsg) {
        this.body = locationValidMsg;
        return;
      }
    }
    //tags
    if (tags) {
      if (!Array.isArray(tags)) {
        this.body = AppInfo.Msg("tags should be Array type", Codes.Activity.TAGS_TYPE);
        return;
      }
      for (let tag of tags) {
        if (!Schemas.ObjectIdValid(tag)) {
          this.body = AppInfo.Msg("tags elements must be objectid string", Codes.Activity.TAGS_DATA);
          return;
        }
      }
    }
    //expose_level 存在
    if (expose_level && !Constants.ExposeLevel[expose_level]) {
      this.body = AppInfo.Msg("wrong expose_level", Codes.Subject.EXPOSE_LEVEL_DATA);
      return;
    }

    yield next
  }

};
