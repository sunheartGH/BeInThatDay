const {Comment, Subject, Activity, User, Message} = require('../models');
const {AppInfo, Codes, Utils, Constants} = require('../utils');

module.exports = class comment {
  constructor () {}

  //@route(get /messages/user/:uid)
  //#token()
  //#mount({chunk:messages,mounts:[sender,relation]})
  * showUserMessages() {
    let {uid} = this.params;
    let pageObj = Utils.parsePageTime(this.query);
    let messages;
    if (uid.toString() == this.state.user.id.toString()) {
      messages = yield Message.findByPage(pageObj, {receiver: this.state.user.id});
      //将未读状态改为已读
      let unreads = [];
      messages.forEach((e) => {
        if (e.state == Constants.MessageState.Unread) {
          unreads.push(e.id);
        }
      })
      if (unreads.length) {
        yield Message.update({id:{$in:unreads}}, {$set:{state: Constants.MessageState.Readed}});
      }
    }
    let page = pageObj.page;
    let size = 0;
    if (messages && messages.length) {
      size = messages.length;
    } else {
      messages = [];
    }
    this.body = AppInfo({page, size, messages});
  }
};
