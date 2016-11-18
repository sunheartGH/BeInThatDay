const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RelationSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建这条关系的用户
  relate_user: {type: Schema.ObjectId, ref: 'User'},          //关联用户
  relate_type: String,                                        //关系类型 Follow, Friend
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now}                 //更新日期
});

let mounts = RelationSchema.statics;

mounts.saveDoc = function* (body) {
  return yield new this(body).save();
}



module.exports = mongoose.model('Relation', RelationSchema, 'Relation');
