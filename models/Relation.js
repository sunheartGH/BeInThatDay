const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Constants = require('../utils/Constants.js');
const Utils = require('../utils/Utils.js');


let DocSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},                                //创建这条关系的用户
  relate_user: {type: Schema.ObjectId, ref: 'User'},                            //关联用户
  relate_type: String,                                                          //关系类型 Follow, Friend
  relate_state: {type: String, default: Constants.RelateState.Unilateral},      //关系状态 Unilateral, Bilateral
                                                                                //关系为关注：关注关系状态都为单方的
                                                                                //关系为好友：经过对方同意后双方的记录状态都为双方的
                                                                                //取消关注/好友关系：状态为 Broken 断开的
  created_at: {type: Date, default: Date.now},                                  //创建日期
  updated_at: {type: Date, default: Date.now},                                  //更新日期
  expound: String,                                                              //关系阐述
});

let method = {
  * findByRelate (creater, ruser, rtype, rstate) {
    if (creater && ruser && rtype) {
      let query = {
        creater:  mongoose.Types.ObjectId(creater.toString()),
        relate_user:  mongoose.Types.ObjectId(ruser.toString())
      };
      if (rtype) {
        query.relate_type = rtype;
      }
      if (rstate) {
        query.relate_state = rstate;
      }
      return yield this.find(query);
    }
  },

  * findByRelates (creater, rusers, rtype, rstate) {
    if (creater && rusers && rusers.length && rtype) {
      let query = {
        creater:  mongoose.Types.ObjectId(creater.toString()),
        relate_user:  {$in: rusers}
      };
      if (rtype) {
        query.relate_type = rtype;
      }
      if (rstate) {
        query.relate_state = rstate;
      }
      return yield this.find(query);
    }
  }
};

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Relation", DocSchema, "Relation")
