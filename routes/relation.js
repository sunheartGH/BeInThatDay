const {Relation, User} = require('../models');
const {AppInfo, Codes} = require('../utils');

module.exports = class relation {
  constructor () {}

  //@route(post /relation)
  //#token()
  * newRelation () {
    //新建关系
    let {relate_user, relate_type} = this.request.body;
    let user = yield User.findById(relate_user);
    if (!user) {
      this.body = AppInfo.Msg("relate_user not found", Codes.Relation.RELATE_USER_FOUND);
      return;
    }
    let relate = Relation.findByRelate(this.state.user.id, relate_user, relate_type);
    if (relate) {
      this.body = AppInfo.Msg("relate has been established", Codes.Common.REPEAT_WRONG);
      return;
    }
    let relation = {
      creater: this.state.user.id,
      relate_user: user.id,
      relate_type
    }
    relation = yield Relation.saveDoc(relation);
    //TODO 向对方用户发送消息提示
    this.body = AppInfo({relation});
  }
};
