const mongoose = require('mongoose');
const Act = mongoose.model("Act");
const {AppInfo} = require('../utils');

module.exports = class act {
  constructor () {}

  * addAct (user, body) {
  }

  * findActMonHot (de, to) {
  }

  * findActDayPage (day, query) {
  }

  * findActTag (actid, acttag) {
  }

  * updateAct () {
    //更新Act信息，更新关联的act信息
  }

  * setActSub (actid, subid) {
  }

  * updateActFavor (actid) {
    //更新sub的favor时更新相应的act的favor
  }

  * addActTag (actid, acttag) {
    //更新sub关联的act的tag
  }

  * updateActTagFavor (actid, acttag) {
    //更新sub管理的act的tag的favor, 标签被赞
  }
};
