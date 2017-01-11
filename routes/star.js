const {Star, User, Subject, Comment} = require('../models');
const {AppInfo, Codes} = require('../utils');

module.exports = class star {
  constructor () {}

  //@route(post /star)
  //#token()
  * newStar () {
    //新建评分
    let {target_user, target_object, target_type, star_score} = this.request.body;
    let star = {
      creater: this.state.user.id,
      star_score,
      target_type,
    }
    let target = yield Star.findByTarget(this.state.user.id, target_object, target_type);
    if (target) {
      this.body = AppInfo.Msg("target has been stared", Codes.Common.REPEAT_WRONG);
      return;
    }
    let user = yield User.findById(target_user);
    if (!user) {
      this.body = AppInfo.Msg("target_user not found", Codes.Star.TARGET_USER_FOUND);
      return;
    }
    let model;
    if (target_type == Subject.modelName) {
      model = Subject
    } else if (target_type == Comment.modelName) {
      model = Comment
    }
    if (model) {
      let tobj = yield model.findById(target_object);
      if (tobj && tobj.creater.toString() == user.id.toString()) {
        star.target_user = user.id;
        yield User.updateStar(user, star_score);

        star.target_object = tobj.id;
        yield model.updateStar(tobj, star_score);

        star = yield Star.saveDoc(star);
        this.body = AppInfo({star});
      } else {
        this.body = AppInfo.Msg("target_object not found", Codes.Star.TARGET_OBJECT_FOUND);
      }
    } else {
      this.body = AppInfo.Msg("service logic error", Codes.Common.SERVICE_LOGIC_ERROR);
    }
  }
};
