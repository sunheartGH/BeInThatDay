let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TagSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  parent: {type: Schema.ObjectId, ref: 'Tag'},                //父标签
  name: String,                                               //标签名
  depict: String                                              //描述
});

let mounts = TagSchema.statics;

mounts.saveDoc = function* (body) {
  if (body) {
    return yield new this(body).save();
  }
}

mounts.findByIds = function* (ids) {
  if (ids && ids.length) {
    return yield this.find({_id: {$in: ids}}).save();
  }
}

module.exports = mongoose.model('Tag', TagSchema, 'Tag');
