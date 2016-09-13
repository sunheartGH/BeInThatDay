let Comment = require("../models").Comment,
    mongoose = require('mongoose');

module.exports = class comment {
  constructor () {}

  * addComment () {
    //添加comment,关联sub和user
    let {sub, post} = this.request.body;
    let subEntity = new Comment({creater: this.session.user, post: post, sub: mongoose.Types.ObjectId(sub)});
    let result = yield subEntity.save();
    return result;
  }

  * findComments () {
    //查找sub对应的comment，并带出评论用户信息
    let subid = this.params.id;
    let {page, size, offset, sort, order} = this.query;
    let execute = Comment.find({"sub": {$eq: subid}}).populate({
                    path: 'creater'
                  }).skip(offset + (page - 1) * size)
                  .limit(size)
                  .sort(sort);;
    let result = yield execute.exec();
    return result;
  }

  * updateCommentLike () {
    //评论被赞，更新赞数
    let commentid= this.params.id;
    let result = yield Sub.update({_id: commentid}, {$inc: {'like': 1}});
    return result;
  }
};
