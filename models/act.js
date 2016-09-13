const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ActSchema = new Schema({
  author: {type: Schema.ObjectId, ref: 'User'},
  date: {type: Date, default: Date.now},
  title: String,
  post: String,
  actday: Date,
  icon: String,
  favor: {type: Number, default: 0}, //收藏数为所有关联的sub的总数
  tags: [{tag:String, like:{type: Number, default: 0}}], //每个tag有赞数
  site: String,
  sub: {type: Schema.ObjectId, ref: 'Sub'}
});

module.exports = mongoose.model('Act', ActSchema, 'acts');
