const {Comment, Subject, Activity, User} = require('../models');
const {AppInfo, Codes, Utils} = require('../utils');

module.exports = class comment {
  constructor () {}

  //@route(post /comment)
  //#token()
  * newComment () {
    //添加新评论
    let {content, under_object, under_type, reply_user} = this.request.body;
    let comment = {
      creater: this.state.user.id,
      content
    }
    if (under_type == Subject.modelName) {
      let subject = yield Subject.findByIdOnExpose(under_object, this.state.user.id, Activity.modelName);
      if (subject) {
        comment.under_type = Subject.modelName;
        comment.under_object = subject.id.toString();
      }
    }
    if (!comment.under_type) {
      this.body = AppInfo.Msg("under_type is wrong type", Codes.Comment.UNDER_TYPE_DATA);
      return;
    }
    if (!comment.under_object) {
      this.body = AppInfo.Msg("under_object not found", Codes.Comment.UNDER_OBJECT_FOUND);
      return;
    }
    if (reply_user) {
      let user = yield User.findById(reply_user);
      if (user) {
        if (user.id.toString() != this.state.user.id.toString()) {
          comment.reply_user = user.id;
        } else {
          this.body = AppInfo.Msg("reply_user can't be self", Codes.Common.USER_SELF_WRONG);
          return;
        }
      } else {
        this.body = AppInfo.Msg("reply_user not found", Codes.Comment.REPLY_USER_FOUND);
        return;
      }
    }
    comment = yield Comment.saveDoc(comment);
    if (comment.under_type == Subject.modelName && comment.under_object) {
      yield Subject.updateIncDoc(comment.under_object, {comment_count: 1}); //更新 Subject 的评论次数
    }
    this.body = AppInfo({comment});
  }

  //@route(get /comments)
  //#iftoken()
  //#mount({chunk:comments,mounts:[creater,relation]});
  * showComments () {
    //查询某对象下的评论列表
    let {under_object, under_type} = this.query;
    let pageObj = Utils.parsePageTime(this.query);
    let comments = yield Comment.findByPageUnderObject(pageObj, under_type, under_object, null);
    let page = pageObj.page;
    let size = 0;
    if (comments && comments.length) {
      size = comments.length;
    } else {
      comments = [];
    }
    this.body = AppInfo({page, size, comments});
  }

};
