let Comment = require("../models").Comment,
    mongoose = require('mongoose');

module.exports = class comment {
  constructor () {}

  * addComment (user, sub, post) {
    //添加comment,关联sub和user
    let subEntity = new Comment({creater: user, sub: mongoose.Types.ObjectId(sub), post: post});
    return yield subEntity.save();
  }

  * findComments (subid, query) {
    //查找sub对应的comment，并带出评论用户信息
    let {page, size, offset, sort, order} = query;
    let execute = Comment.find({"sub": {$eq: subid}}).populate({
                    path: 'creater'
                  }).skip(offset + (page - 1) * size)
                  .limit(size)
                  .sort(sort);;
    return yield execute.exec();
  }

  * updateCommentLike (commentid) {
    //评论被赞，更新赞数
    return yield Sub.update({_id: commentid}, {$inc: {'like': 1}});
  }
};
