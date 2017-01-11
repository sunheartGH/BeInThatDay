const {Message} = require('../models');
const {AppInfo, Codes, Schemas, Constants, Utils} = require('../utils');

module.exports = class comment {
  constructor () {}

  * showUserMessages (next) {
    let {uid} = this.params;
    if (!Schemas.ObjectIdValid(uid)) {
      this.body = AppInfo.Msg("userid must be objectid string", Codes.Message.RECEIVER_DATA);
      return;
    }
    yield next;
  }
};
