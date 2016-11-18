let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CommentSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  content: String,                                            //评论内容
  under_object: Schema.ObjectId,                              //归属于
  under_type: String,                                         //归属对象类型
  reply_user: {type: Schema.ObjectId, ref: 'User'},           //回复用户
  star_score: {type: Number, default: 0},                     //分数
  star_count: {type: Number, default: 0}                      //打分次数
});
let mounts = CommentSchema.statics;

mounts.saveDoc = function* (body) {
  if (body) {
    return yield new this(body).save();
  }
}

mounts.updateStar = function* (comment, score) {
  if (comment && comment.id && score) {
    let body = {
      star_score: ((comment.star_score || 0) * (comment.star_count || 0) + score ) / ((comment.star_count||0) + 1),
      star_count: (comment.star_count || 0) + 1
    }
    return yield this.findOneAndUpdate({_id: comment.id}, {$set: body});
  }
}










mounts.findComments = function* (subid, query) {
  //查找sub对应的comment，并带出评论用户信息
  let {page, size, offset, sort, order} = query;
  let execute = Comment.find({"sub": {$eq: subid}}).populate({
                  path: 'creater'
                }).skip(offset + (page - 1) * size)
                .limit(size)
                .sort(sort);;
  return yield execute.exec();
}

mounts.updateCommentLike = function* (commentid) {
  //评论被赞，更新赞数
  return yield Sub.update({_id: commentid}, {$inc: {'like': 1}});
}



module.exports = mongoose.model('Comment', CommentSchema, 'Comment');
