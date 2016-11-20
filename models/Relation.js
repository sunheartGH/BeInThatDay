const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Constants = require('../utils/Constants.js');
const Utils = require('../utils/Utils.js');


let RelationSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},                                //创建这条关系的用户
  relate_user: {type: Schema.ObjectId, ref: 'User'},                            //关联用户
  relate_type: String,                                                          //关系类型 Follow, Friend
  relate_state: {type: String, default: Constants.RelateState.Unilateral},      //关系状态 Unilateral, Bilateral
                                                                                //关系为关注：关注关系状态都为单方的
                                                                                //取消关注：删除单方记录
                                                                                //关系为好友：经过对方同意后双方的记录状态都为双方的
                                                                                //取消好友关系：删除单方/双方记录
  created_at: {type: Date, default: Date.now},                                  //创建日期
  updated_at: {type: Date, default: Date.now}                                   //更新日期
});

let mounts = RelationSchema.statics;

mounts.saveDoc = function* (body) {
  if (body) {
    return yield new this(body).save();
  }
}

mounts.findByRelate = function* (creater, ruser, rtype) {
  if (creater && ruser && rtype) {
    return yield this.findOne({
      creater:  mongoose.Types.ObjectId(creater.toString()),
      relate_user:  mongoose.Types.ObjectId(ruser.toString()),
      relate_type: rtype
    })
  }
}

module.exports = mongoose.model('Relation', RelationSchema, 'Relation');
