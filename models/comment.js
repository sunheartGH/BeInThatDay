let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CommentSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'}, //创建者id
  date: { type: Date, default: Date.now }, //创建日期
  post: String, //评论内容
  sub: Schema.ObjectId, //关联subid
  like: {type: Number, default: 0} //赞数
});

let Comment = mongoose.model('Comment', CommentSchema, 'comments');

CommentSchema.statics.saveComment = function* (user, sub, post) {
  //添加comment,关联sub和user
  let subEntity = new Comment({creater: user, sub: mongoose.Types.ObjectId(sub), post: post});
  return yield subEntity.save();
}

CommentSchema.statics.findComments = function* (subid, query) {
  //查找sub对应的comment，并带出评论用户信息
  let {page, size, offset, sort, order} = query;
  let execute = Comment.find({"sub": {$eq: subid}}).populate({
                  path: 'creater'
                }).skip(offset + (page - 1) * size)
                .limit(size)
                .sort(sort);;
  return yield execute.exec();
}

CommentSchema.statics.updateCommentLike = function* (commentid) {
  //评论被赞，更新赞数
  return yield Sub.update({_id: commentid}, {$inc: {'like': 1}});
}
