const {Activity} = require('../models');

module.exports = class activity {
  constructor () {}

  //@route(post /activity)
  //#token()
  * newActivity () {
    //添加activity
    this.request.body.creater = this.state.user.id;
    this.body = yield new Activity(this.request.body).save();
  }

  * updateActivityInfo () {
    //更新sub时更新act信息，如sub被收藏时更新act favor
  }

  * updateActivityTag () {
    //act添加tag
  }

  * updateActivityTagLike () {
    //更新act tag的favor
  }

  //@route(get /activitys)
  * findActivitys () {
    //查询多个Acts
    this.body = yield Activity.findActivitys();
  }

  //@route(get /activity/:id)
  * findActivity () {
    //查询某个Acts
    this.body = yield Activity.findActivityById(this.params.id);
  }
};
