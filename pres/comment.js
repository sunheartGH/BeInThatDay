const {Comment} = require('../models');
const {AppInfo, Codes, Schemas, Constants} = require('../utils');

module.exports = class comment {
  constructor () {}

  * newComment (next) {
    //参数格式判断
    let {content, under_object, under_type, reply_user} = this.request.body;
    let validMsg = Schemas.ValidTypeToMsg(`content,
      under_object, under_type`,
      Comment, this.request.body);

    if (validMsg) {
      this.body = validMsg;
      return;
    }

    if (!Schemas.ObjectIdValid(under_object)) {
      this.body = AppInfo.Msg("under_object must be objectid string", Codes.Comment.UNDER_OBJECT_DATA);
      return;
    }

    if (reply_user) {
      if (!Schemas.ObjectIdValid(reply_user)) {
        this.body = AppInfo.Msg("reply_user must be objectid string", Codes.Subject.REPLY_USER_DATA);
        return;
      }
    }

    if (content.length < 1 || content.length > 256) {
      this.body = AppInfo.Msg("content length is unlegal", Codes.Comment.CONTENT_DATA);
      return;
    }

    yield next;
  }

  * showComments (next) {
    //参数判断
    let {under_object, under_type} = this.query;

    let validMsg = Schemas.ValidTypeToMsg(
      `under_object,under_type`,
      Comment, this.query);

    if (validMsg) {
      this.body = validMsg;
      return;
    }

    if (!Schemas.ObjectIdValid(under_object)) {
      this.body = AppInfo.Msg("under_object must be objectid string", Codes.Comment.UNDER_OBJECT_DATA);
      return;
    }

    yield next;
  }
};
