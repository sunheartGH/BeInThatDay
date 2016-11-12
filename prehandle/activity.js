const {AppInfo, Codes, Schemas} = require('../utils');
const {Activity} = require('../models');
const validator = require('validator');
//参数验证:

module.exports = class activity {
  constructor () {}

  * newActivity (next) {
    //添加activity
    let {title, cover_picurl,
      content, site, start_time, end_time,
      fee, location, tags} = this.request.body;

    let validMsg = Schemas.ValidType(`title,
      cover_picurl, content, start_time, end_time`,
      Activity, this.request.body);

    if (validMsg) {
      this.body = validMsg;
      return;
    }

    //title, content to trim
    this.request.body.title = this.request.body.title.trim();
    this.request.body.content = this.request.body.content.trim();
    //判断end_time > start_time
    if (new Date(start_time).getTime() <= new Date().getTime()) {
      this.body = AppInfo.Msg("start_time must greater than now", Codes.Activity.START_TIME_DATA);
      return;
    }
    if (new Date(start_time).getTime() >= new Date(end_time).getTime()) {
      this.body = AppInfo.Msg("end_time must greater than start_time", Codes.Activity.END_TIME_DATA);
      return;
    }
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
      let feeValidMsg = Schemas.ValidType(`fee`, Activity, this.request.body);
      if (feeValidMsg) {
        this.body = feeValidMsg;
        return;
      }
      if (fee < 0) {
        this.body = AppInfo.Msg("fee must be greater than zero", Codes.Activity.FEE_DATA);
        return;
      }
    }
    //location 存在
    if (location) {
      let locationValidMsg = Schemas.ValidType(`location`, Activity, this.request.body);
      if (locationValidMsg) {
        this.body = locationValidMsg;
        return;
      }
    }
    //tags 存在
    if (tags) {
      let tagsValidMsg = Schemas.ValidType(`tags`, Activity, this.request.body);
      if (tagsValidMsg) {
        this.body = tagsValidMsg;
        return;
      }
      for (let i in tags) {
        if (!Schemas.ObjectIdValid(tags[i])) {
          this.body = AppInfo.Msg("tags element must be objectid str", Codes.Activity.TAGS_DATA);
          return;
        }
      }
    }

    yield next;
  }

  * updateActivityInfo () {
    //更新sub时更新act信息，如sub被收藏时更新act favor
  }

  * updateActivityTag () {
    //act添加tag
  }

  * updateActivityTagLike () {
    //更新act tag的favor
  }

  * findActivitys (next) {
    //查询多个Acts
    yield next;
  }

  * findActivity (next) {
    //查询某个Acts
    yield next;
  }
};
