const mongoose = require('mongoose');
const Sub = mongoose.model("Sub");

module.exports = class sub {
  constructor () {}

  * addSub (user, actid) {
    //添加sub时添加act作关联，并关联user
  }

  * findSub (subid) {
    //查询具体的某个sub，关联act, 并查询comment
  }

  * findUserSub (user, subid) {
    //查询具体的某个sub
  }

  * findSubJust (subid) {
    //查询具体的某个sub
  }

  * findUserMonHot (userid, de, to) {
    //查询User的某月日历
  }

  * findUserDayPage (day, userid, query) {
    //查询User的某天的日历项，做最热/最新排序
  }

  * updateSub () {
    //更新sub信息，更新关联的act信息
  }

  * setSubSource (subid, sourceid) {
    //更新sub的origin字段数据，使其关联其他sub或自己，以此判断是否是原创
  }

  * updateSubComments (sub, commentid) {
    //更新sub关联的act的tag
  }

  * updateSubFavor (subid) {
    //用户收藏sub
    //更新某个sub的favor
  }
};
