const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Utils = require('../utils/Utils.js');

let DocSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  target_user: {type: Schema.ObjectId, ref: 'User'},          //星星目标用户
  target_object: Schema.ObjectId,                             //星星目标对象
  target_type: String,                                        //星星目标类型
  star_score: Number                                          //分数
});

let method = {
  * findByTarget (creater, tobject, ttype) {
    if (creater && tobject && ttype) {
      let result = yield this.findOne({
        creater:  mongoose.Types.ObjectId(creater.toString()),
        target_object:  mongoose.Types.ObjectId(tobject.toString()),
        target_type: ttype
      })
      return result;
    }
  }
};

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Star", DocSchema, "Star")
