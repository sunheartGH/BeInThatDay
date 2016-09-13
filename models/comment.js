let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CommentSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'}, //创建者id
  date: { type: Date, default: Date.now }, //创建日期
  post: String, //评论内容
  sub: Schema.ObjectId, //关联subid
  like: {type: Number, default: 0} //赞数
});

module.exports = mongoose.model('Comment', CommentSchema, 'comments');
