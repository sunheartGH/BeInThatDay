const mongoose = require('mongoose');
const Comment = mongoose.model("Comment");

module.exports = class comment {
  constructor () {}

  * addComment (user, sub, post) {
    //添加comment,关联sub和user
  }

  * findComments (subid, query) {
    //查找sub对应的comment，并带出评论用户信息
  }

  * updateCommentLike (commentid) {
    //评论被赞，更新赞数
  }
};
