const {Comment, Subject, User} = require('../models');
const {AppInfo, Codes} = require('../utils');

const pageRgx = /^[1-9]+0*$/;
const sizeRgx = /^[1-5]0?$/;
const offsetRgx = /^[0-9]+$/;
const orderObj = {desc: -1, asc: 1};
const sortRgx = /date|favor/;

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
      let subject = yield Subject.findById(under_object);
      if (subject) {
        comment.under_type = Subject.modelName;
        comment.under_object = subject.id;
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
        comment.reply_user = user.id;
      } else {
        this.body = AppInfo.Msg("reply_user not found", Codes.Comment.REPLY_USER_FOUND);
        return;
      }
    }
    comment = yield Comment.saveDoc(comment);
    if (comment.under_type == Subject.modelName && comment.under_object) {
      yield Subject.updateCommentCount(comment.under_object); //更新 Subject 的评论次数
    }
    this.body = AppInfo({comment});
  }

  //@route(get /comment/sub/:id)
  * querySubComments () {
    //查询某sub的评论
    let subid = this.params.id;
    if (subid) {
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

      let result = yield Comment.findComments(subid, this.query);
      if (result) {
        this.body = result;
      } else {
        this.body = "query comment for sub is wrong !"
      }
    } else {
      this.body = "sub id can't be none";
    }
  }

  //@route(put /comment/:id/like)
  * updateCommentLike () {
    //某评论被赞
    let commentid = this.params.id;
    if (commentid) {
      let result = yield Comment.updateCommentLike(commentid);
      if (result) {
        this.body = result;
      } else {
        this.body = "comment like has wrong";
      }
    } else {
      this.body = "comment id is wrong";
    }

  }
};
