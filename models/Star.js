let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let StarSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  target_user: {type: Schema.ObjectId, ref: 'User'},          //星星目标用户
  target_object: Schema.ObjectId,                             //星星目标对象
  target_type: String,                                        //星星目标类型
  star_score: Number                                          //分数
});

let mounts = StarSchema.statics;

mounts.saveDoc = function* (body) {
  return yield new this(body).save();
}

module.exports = mongoose.model('Star', StarSchema, 'Star');
