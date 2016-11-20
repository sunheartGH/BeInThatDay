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
    //TODO 权限判断
    let activity = yield Subject.findByIdTakeRef(subid, Activity.modelName);
    this.body = AppInfo({activity});
  }

  //@route(get /activity/:subid/content)
  //#token()
  * showActivityContent () {
    //查看某个activity
    let {subid} = this.params;
    //TODO 权限判断
    let subject = yield Subject.findById(subid, {refer_type: Activity.modelName}, {refer_object: 1});
    if (subject) {
      let activity = yield Activity.findById(subject.refer_object, null, {content: 1});
      this.body = AppInfo({content: activity.content});
    } else {
      this.body = AppInfo.Msg("id not found", Codes.Subject._ID_FOUND);
      return;
    }
  }

  //@route(get /activitys)
  //#token()
  * showActivitys () {
    //查看activity列表
    let pageObj = Utils.parsePageTime(this.query);
    let uid = Utils.parseUserId(this.query);
    let activitys = yield Activity.findStartTimePageOnExpose(pageObj, this.state.user.id, uid, {content: 0});
    let page = pageObj.page;
    let size = 0;
    if (activitys && activitys.length) {
      size = activitys.length;
    } else {
      activitys = [];
    }
    this.body = AppInfo({page, size, activitys});
  }

  //@route(get /activitys/calendar)
  //#token()
  * showActivitysCalendar () {
    let {from, until} = this.query;
    let uid = Utils.parseUserId(this.query);
    let activitys = yield Activity.findStartTimeCalendarOnExpose(from, until, this.state.user.id, uid, {content: 0});
    this.body = AppInfo({activitys});
  }

  //@route(post /activity/favorite/:subid)
  //#token()
  * favoriteActivity () {
    //用户收藏/转发某activity
    //TODO 权限判断
    let {subid} = this.params;
    let subject = yield Subject.findByIdTakeRef(subid, Activity.modelName);
    subject = {
      creater: this.state.user.id,
      refer_type: subject.refer_type,
      refer_object: subject.refer_object
    }
    subject = yield Subject.saveDoc(subject);
    yield Subject.updateIncDoc(subid, {favorite_count: 1});
    let activity = yield Subject.findByIdTakeRef(subject.id, Activity.modelName);
    this.body = AppInfo({activity});
  }

  //@route(put /activity/:subid)
  //#token()
  * modifyActivity () {
    //TODO 权限判断
    let {subid} = this.params;
    let {title, cover_picurl, content, site, start_time,
      end_time, fee, tags, expose_level} = this.request.body;

    let subject = yield Subject.findById(subid, Activity.modelName);
    if (subject) {
      yield Activity.updateSetDoc(subject.refer_object, {title, cover_picurl, content, site, start_time, end_time, fee});
      if (tags) {
        let tl = tags.length;
        tags = yield Tag.findByIds(tags);
        if (tl == tags.length) {
          yield Activity.updatePushDoc(subject.refer_object, {tags});
        } else {
          this.body = AppInfo.Msg("some tag not found", Codes.Activity.TAGS_FOUND);
          return;
        }
      }
      if (expose_level) {
        yield Subject.updateSetDoc(subid, {expose_level});
      }
      this.body = AppInfo({title, cover_picurl, content, site, start_time, end_time, fee, tags, expose_level});
    } else {
      this.body = AppInfo.Msg("id not found", Codes.Subject._ID_FOUND);
      return;
    }
  }

};
