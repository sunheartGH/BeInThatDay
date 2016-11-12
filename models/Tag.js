let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let TagSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  parent_tag: {type: Schema.ObjectId, ref: 'Tag'},            //父标签
  name: String,                                               //标签名
  depict: String                                              //描述
});


TagSchema.statics.saveTag = function* () {
  let entity = new Tag({});
  return yield entity.save();
}

module.exports = mongoose.model('Tag', TagSchema, 'Tag');
