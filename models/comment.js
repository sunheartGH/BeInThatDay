let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CommentSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  content: String,                                            //评论内容
  under_object: Schema.ObjectId,                              //归属于
  object_type: String,                                        //归属对象类型
  reply_user: {type: Schema.ObjectId, ref: 'User'},           //回复用户
  star_score: {type: Number, default: 0},                     //分数
  star_count: {type: Number, default: 0}                      //打分次数
});

CommentSchema.statics.saveComment = function* (user, sub, post) {
  //添加comment,关联sub和user
  let entity = new Comment({creater: user, sub: mongoose.Types.ObjectId(sub), post: post});
  return yield entity.save();
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



module.exports = mongoose.model('Comment', CommentSchema, 'Comment');
