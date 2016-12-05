const {Activity, Subject, Location, Tag, Relation, User} = require('../models');
const {AppInfo, Codes, Utils, Constants} = require('../utils');

module.exports = class activity {
  constructor () {}

  //@route(post /activity)
  //#token()
  * newActivity () {
    //添加activity
    let {title, cover_picurl,
      content, site, start_time, end_time,
      fee, location, tags, expose_level} = this.request.body;

    //生成摘要内容
    let summary = content.slice(0, 120);
    summary = summary.slice(0, summary.lastIndexOf(" "));
    if (summary.length == 120) {
      summary += " ...";
    }
    let activity = {
      creater: this.state.user.id,
      title,
      cover_picurl,
      content,
      summary,
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
    let subject = {
      creater: this.state.user.id,
      refer_type: Activity.modelName,
      refer_object: activity.id
    }
    if (expose_level) {
      subject.expose_level = expose_level;
    }
    subject = yield Subject.saveDoc(subject);
    //更新用户的 create_subjects
    yield User.updateIncDoc(this.state.user.id, {create_subjects:1})
    subject.refer_object = activity;
    this.body = AppInfo({activity: subject});
  }

  //@route(get /activity/:subid)
  //#iftoken()
  //#mount({chunk:activity,mounts:[creater,relation,tags,location]});
  * showActivity () {
    //查看某个activity
    let {subid} = this.params;

    //公开级别权限判断查询
    let subject;
    if (this.state.user) {
      subject = yield Subject.findByIdOnExpose(subid, this.state.user.id, Activity.modelName, null,
        {creater:1, refer_object:{creater:1}});
    } else {
      subject = yield Subject.findById(subid,
        {refer_type: Activity.modelName,expose_level: Constants.ExposeLevel.Public});
    }
    if (subject) {
      let activity = yield Activity.findById(subject.refer_object, null, {content:0, summary:0});
      subject.refer_object = activity;
      this.body = AppInfo({activity: subject});
    } else {
      this.body = AppInfo.Msg("id not found", Codes.Subject._ID_FOUND);
    }
  }

  //@route(get /activity/:subid/content)
  //#iftoken()
  * showActivityContent () {
    //查看某个activity
    let {subid} = this.params;

    //公开级别权限判断查询
    let subject;
    if (this.state.user) {
      subject = yield Subject.findByIdOnExpose(subid, this.state.user.id, Activity.modelName);
    } else {
      subject = yield Subject.findById(subid, {refer_type: Activity.modelName, expose_level: Constants.ExposeLevel.Public});
    }
    if (subject) {
      let activity = yield Activity.findById(subject.refer_object, null, {content: 1});
      this.body = AppInfo({content: activity.content});
    } else {
      this.body = AppInfo.Msg("id not found", Codes.Subject._ID_FOUND);
    }
  }

  //@route(get /activitys)
  //#iftoken()
  //#mount({chunk:activitys,mounts:[creater,relation,tags,location]});
  * showActivitys () {
    //查看activity列表
    let pageObj = Utils.parsePageTime(this.query);
    let uid = Utils.parseUserId(this.query);
    let activitys;
    if (this.state.user) {
      activitys = yield Activity.findStartTimePageOnExpose(pageObj, this.state.user.id,
        uid, null);
    } else {
      activitys = yield Activity.findStartTimePage(pageObj, null);
    }
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
  //#iftoken()
  * showActivitysCalendar () {
    let {from, until} = this.query;
    let uid = Utils.parseUserId(this.query);
    let activitys;
    if (this.state.user) {
      activitys = yield Activity.findStartTimeCalendarOnExpose(from, until, this.state.user.id, uid);
    } else {
      activitys = yield Activity.findStartTimeCalendar(from, until);
    }
    this.body = AppInfo({activitys});
  }

  //@route(post /activity/favorite/:subid)
  //#token()
  * favoriteActivity () {
    //用户收藏/转发某activity
    //公开级别权限判断查询
    let {subid} = this.params;
    let subject = yield Subject.findByIdOnExpose(subid, this.state.user.id, Activity.modelName);
    if (subject) {
      //判断是否已收藏过
      let ref = Subject.findByRefObject(subject.refer_object, Activity.modelName, {creater: this.state.user.id});
      if (ref && ref.length) {
        this.body = AppInfo.Msg("activity has favorited", Codes.Common.REPEAT_WRONG);
        return;
      }

      subject = {
        creater: this.state.user.id,
        refer_type: subject.refer_type,
        refer_object: subject.refer_object,
        expose_level: Constants.ExposeLevel.Private
      }
      subject = yield Subject.saveDoc(subject);
      yield Subject.updateIncDoc(subid, {favorite_count: 1});
      //更新用户的 favor_subjects
      yield User.updateIncDoc(this.state.user.id, {favor_subjects:1});
      let activity = yield Subject.findByIdTakeRef(subject.id, Activity.modelName);
      this.body = AppInfo({activity});
    } else {
      this.body = AppInfo.Msg("id not found", Codes.Subject._ID_FOUND);
    }
  }

  //@route(put /activity/:subid)
  //#token()
  * modifyActivity () {
    let {subid} = this.params;
    let {title, cover_picurl, content, site, start_time,
      end_time, fee, tags, expose_level} = this.request.body;

    //权限判断
    let subject = yield Subject.findByIdTakeRef(subid, Activity.modelName);
    if (subject && subject.creater == this.state.user.id) {
      if (expose_level) {
        yield Subject.updateSetDoc(subject.id, {expose_level});
      }
      if (subject.refer_object.creater.toString() == this.state.user.id.toString()) {
        yield Activity.updateSetDoc(subject.refer_object.id, {title, cover_picurl,
          content, site, start_time, end_time, fee});

        if (tags) {
          let findTags = yield Tag.findByIds(tags, {type: Activity.modelName});
          if (tags.length == findTags.length) {
            yield Activity.updateSetDoc(subject.refer_object.id, {tags});
          } else {
            this.body = AppInfo.Msg("some tag not found", Codes.Activity.TAGS_FOUND);
            return;
          }
        }
      } else {
        this.body = AppInfo.Msg("activity modify not allowed", Codes.Common.PERMISSION_FORBID);
        return;
      }
      this.body = AppInfo({title, cover_picurl, content, site, start_time, end_time, fee, tags, expose_level});
    } else {
      this.body = AppInfo.Msg("id not found", Codes.Subject._ID_FOUND);
    }
  }

};
