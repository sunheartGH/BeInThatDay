const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let RelationSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},                 //创建这条关系的用户
  relate_user: {type: Schema.ObjectId, ref: 'User'},          //关联用户
  relate_type: String,                                        //关系类型
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now}                 //更新日期
});


RelationSchema.statics.saveRelation = function* (user, followid) {
  let follow = new Relation({user: user, follow: mongoose.Types.ObjectId(followid)});
  return yield follow.save();
}



module.exports = mongoose.model('Relation', RelationSchema, 'Relation');
