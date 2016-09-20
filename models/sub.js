const mongoose= require( 'mongoose');
const Schema = mongoose.Schema;

let SubSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'}, //创建者id
  date: {type: Date, default: Date.now}, //创建日期
  favor: {type: Number, default: 0}, //收藏数
  act: {type: Schema.ObjectId, ref: "Act"}, //关联的act id
  source: {type: Schema.ObjectId, ref: 'Sub'}, //被收藏时设置为目标sub id,若此sub的id和它的source id一样，证明原创
  comments: [{type: Schema.ObjectId, ref:'Comment'}]
});

module.exports = mongoose.model('Sub', SubSchema, 'subs');
