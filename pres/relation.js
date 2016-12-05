const {Relation} = require('../models');
const {AppInfo, Codes, Schemas, Constants} = require('../utils');

module.exports = class relation {
  constructor () {}

  * handleRelation (next) {
    let {relate_user, relate_type} = this.request.body;
    let validMsg = Schemas.ValidTypeToMsg(`relate_user, relate_type`,
      Relation, this.request.body);

    if (validMsg) {
      this.body = validMsg;
      return;
    }
    if (!Constants.RelateType[relate_type]) {
      this.body = AppInfo.Msg("relate_type wrong data", Codes.Relation.RELATE_TYPE_DATA);
      return;
    }
    if (relate_user == this.state.user.id.toString()) {
      this.body = AppInfo.Msg("self operate wrong", Codes.Common.USER_SELF_WRONG);
      return;
    }
    yield next;
  }
};
