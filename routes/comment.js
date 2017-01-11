const {Comment, Subject, Activity, User, Message} = require('../models');
const {AppInfo, Codes, Utils, Socket, Constants} = require('../utils');

module.exports = class comment {
  constructor () {}

  //@route(post /comment)
  //#token()
  //#mount({chunk:comment,mounts:[creater,relation,reply]})
  * newComment () {
    //添加新评论
    let {content, under_object, under_type, reply_comment, reply_user} = this.request.body;
    let comment = {
      creater: this.state.user.id,
      content
    }
    let summary;
    if (content.length > 24) {
      summary = content.slice(0, 21);
      summary += '...';
    } else {
      summary = content;
    }
    let underMessage;
    let replyMessage;
    if (under_type == Subject.modelName || under_type == Activity.modelName) {
      let subject = yield Subject.findByIdOnExpose(under_object, this.state.user.id, Activity.modelName);
      if (subject) {
        comment.under_type = Subject.modelName;
        comment.under_object = subject.id.toString();

        if (this.state.user.id.toString() != subject.creater.toString()) {
          underMessage = {
            receiver: subject.creater,
            sender: this.state.user.id,
            title: Constants.MessageTitle.UnderComment,
            content_type: Constants.MessageContentType.UnderComment,
            content: Constants.MessageContent.UnderComment,
            stuff:[
              {key:'sender',text: this.state.user.nickname, value: this.state.user.id},
              {key:'title',text: subject.refer_object.title, value: subject.id},
              {key:'content',text: summary, value: ''},
            ]
          };
        }
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
    if (reply_comment && reply_user) {
      let replyComment = yield Comment.findById(reply_comment);
      let user = yield User.findById(reply_user);
      if (!replyComment) {
        this.body = AppInfo.Msg("reply_comment not found", Codes.Comment.REPLY_COMMENT_FOUND);
        return;
      }
      if (!user) {
        this.body = AppInfo.Msg("reply_user not found", Codes.Comment.REPLY_USER_FOUND);
        return;
      }
      if (user.id.toString() == this.state.user.id.toString()) {
        this.body = AppInfo.Msg("reply_user can't be self", Codes.Common.USER_SELF_WRONG);
        return;
      }
      if (replyComment.creater.toString() != user.id.toString()) {
        this.body = AppInfo.Msg("reply_user not match reply_comment creater", Codes.Comment.REPLY_USER_DATA);
        return;
      }
      comment.reply_user = user.id;
      comment.reply_comment = replyComment.id;

      let replySummary;
      if (replyComment.content.length > 24) {
        replySummary = replyComment.content.length.slice(0, 21);
        replySummary += '...';
      } else {
        replySummary = replyComment.content.length;
      }
      replyMessage = {
        receiver: user.id,
        sender: this.state.user.id,
        title: Constants.MessageTitle.ReplyComment,
        content_type: Constants.MessageContentType.ReplyComment,
        content: Constants.MessageContent.ReplyComment,
        stuff:[
          {key:'sender',text: this.state.user.nickname, value: this.state.user.id},
          {key:'title',text: subject.refer_object.title, value: subject.id},
          {key:'comment',text: replySummary, value: ''},
          {key:'content',text: summary, value: ''},
        ]
      };
    }
    comment = yield Comment.saveDoc(comment);



    if (comment.under_type == Subject.modelName && comment.under_object) {
      yield Subject.updateIncDoc(comment.under_object, {comment_count: 1}); //更新 Subject 的评论次数
    }

    if (underMessage) {
      yield Message.saveDoc(underMessage);
      Socket.sendMessage(underMessage.receiver, underMessage.content_type);
    }
    if (replyMessage) {
      yield Message.saveDoc(replyMessage);
      Socket.sendMessage(replyMessage.receiver, replyMessage.content_type);
    }

    this.body = AppInfo({comment});
  }

  //@route(get /comments)
  //#iftoken()
  //#mount({chunk:comments,mounts:[creater,relation,reply]})
  * showComments () {
    //查询某对象下的评论列表
    let {under_object, under_type} = this.query;
    if (under_type == Subject.modelName || under_type == Activity.modelName) {
      under_type = Subject.modelName;
    }
    let pageObj = Utils.parsePageTime(this.query);
    let comments = yield Comment.findByPageUnderObject(pageObj, under_type, under_object);
    let count = yield Comment.countByPageUnderObject(pageObj, under_type, under_object);
    count = count || 0;
    let page = pageObj.page;
    let size = 0;
    if (comments && comments.length) {
      size = comments.length;
    } else {
      comments = [];
    }
    this.body = AppInfo({page, size, count, comments});
  }

  //@route(get /comments/user/:uid)
  //#token()
  //#mount({chunk:comments,mounts:[creater,relation,reply]})
  * showUserComments() {
    let {uid} = this.params;
    let {under_type} = this.query;
    let pageObj = Utils.parsePageTime(this.query);
    let comments = yield Comment.findCreatedByPageOnExpose(pageObj, under_type, this.state.user.id, uid);
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
