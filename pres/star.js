const {Star} = require('../models');
const {AppInfo, Codes, Schemas} = require('../utils');

module.exports = class star {
  constructor () {}

  * newStar (next) {
    let {target_user, target_object, target_type, star_score} = this.request.body;
    let validMsg = Schemas.ValidTypeToMsg(`target_user, target_object,
      target_type, star_score`,
      Star, this.request.body);

    if (validMsg) {
      this.body = validMsg;
      return;
    }
    if (star_score <= 0 || star_score > 5 || star_score%1 != 0) {
      this.body = AppInfo.Msg("star_score wrong data", Codes.Star.STAR_SCORE_DATA);
      return;
    }
    if (target_user == this.state.user.id.toString()) {
      this.body = AppInfo.Msg("self operate wrong", Codes.Common.USER_SELF_WRONG);
      return;
    }
    yield next;
  }
};
