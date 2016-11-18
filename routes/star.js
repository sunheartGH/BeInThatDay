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
      star_score: star_score
    }
    let user = yield User.findById(target_user);
    if (user) {
      star.target_user = user.id;

      yield User.updateStar(user, star_score);
    } else {
      this.body = AppInfo.Msg("target_user not found", Codes.Star.TARGET_USER_FOUND);
      return;
    }
    if (target_type == Subject.modelName) {
      let subject = Subject.findById(target_object);
      if (subject && subject.creater == user.id) {
        star.target_type = Subject.modelName;
        star.target_object = subject.id;

        yield Subject.updateStar(subject, star_score);
      }
    } else if (target_type == Comment.modelName) {
      let comment = Comment.findById(target_object);
      if (comment && comment.creater == user.id) {
        star.target_type = Comment.modelName;
        star.target_object = comment.id;

        yield Comment.updateStar(comment, star_score);
      }
    }
    if (!star.target_type) {
      this.body = AppInfo.Msg("target_type is wrong type", Codes.Star.TARGET_TYPE_DATA);
      return;
    }
    if (!star.target_object) {
      this.body = AppInfo.Msg("target_object not found", Codes.Star.TARGET_OBJECT_FOUND);
      return;
    }
    star = yield Star.saveDoc(star);
    this.body = AppInfo({star: star});
  }
};
