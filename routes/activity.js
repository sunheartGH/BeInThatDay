const {Activity, Subject, Location, Tag} = require('../models');
const {AppInfo, Codes, Utils} = require('../utils');

module.exports = class activity {
  constructor () {}

  //@route(post /activity)
  //#token()
  * newActivity () {
    //添加activity
    let {title, cover_picurl,
      content, site, start_time, end_time,
      fee, location, tags} = this.request.body;
    let activity = {
      creater: this.state.user.id,
      title,
      cover_picurl,
      content,
      site,
      fee
    }
    if (start_time) {
      activity.start_time = new Date(start_time);
    }
    if (end_time) {
      activity.end_time = new Date(end_time);
    }
    if (location) {
      location = yield Location.findById(location);
      if (location) {
        activity.location = location.id;
      } else {
        this.body = AppInfo.Msg("location not found", Codes.Activity.LOCATION_FOUND);
        return;
      }
    }
    if (tags) {
      tags = yield Tag.findByIds(tags);
      if (tags && tags.length) {
        activity.tags = [];
        for (let tag of tags) {
          activity.tags.push(tag.id);
        }
      } else {
        this.body = AppInfo.Msg("tags not found", Codes.Activity.TAGS_FOUND);
        return;
      }
    }
    activity = yield Activity.saveDoc(activity);
    activity = activity.toObject();
    let subject = {
      creater: this.state.user.id,
      refer_type: Activity.modelName,
      refer_object: activity.id
    }
    subject = yield Subject.saveDoc(subject);
    subject = subject.toObject();
    subject.refer_object = activity;
    this.body = AppInfo({activity: subject});
  }

  //@route(get /activity/:subid)
  //#token()
  * showActivity () {
    //查看某个activity
    let {subid} = this.params;
    let subject = yield Subject.findByIdTakeRef(subid, Activity.modelName);
    this.body = AppInfo({activity: subject});
  }

  //@route(get /activitys)
  //#token()
  * showActivitys () {
    //查看activity列表
    let pageObj = Utils.parsePageTime(this.query);
    let subjects = yield Subject.findByPageTimeTakeRef(pageObj, Activity.modelName);
    let page = pageObj.page;
    let size = 0;
    if (subjects && subjects.length) {
      size = subjects.length;
    } else {
      subjects = [];
    }
    this.body = AppInfo({page, size, activitys: subjects});
  }

  //@route(get /activitys/calendar)
  //#token()
  * showActivitysCalendar () {
    let {from, until} = this.query;
    let subjects = yield Subject.findForActivityInterval(from, until, Activity.modelName);
    this.body = AppInfo({activitys: subjects});
  }

  //@route(get /activitys/:daily)
  //#token()
  * showActivitysDaily () {
    this.body = AppInfo({activitys: []});
  }

  //@route(get /activitys/:uid/calendar)
  //#token()
  * showActivitysUserCalendar () {
    let {from, until} = this.query;
    let {uid} = this.params;
    let subjects = yield Subject.findForActivityInterval(from, until, Activity.modelName, uid);
    this.body = AppInfo({activitys: subjects});
  }

  //@route(get /activitys/:uid/:daily)
  //#token()
  * showActivitysUserDaily () {
    this.body = AppInfo({activitys: []});
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

  //@route(get /activitys)
  * findActivitys () {
    //查询多个Acts
    this.body = yield Activity.findActivitys();
  }

  //@route(get /activity/:id)
  * findActivity () {
    //查询某个Acts
    this.body = yield Activity.findActivityById(this.params.id);
  }
};
