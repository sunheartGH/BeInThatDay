const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Utils = require('../utils/Utils.js');
const Constants = require('../utils/Constants.js');

let DocSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  content: String,                                            //评论内容
  under_object: Schema.ObjectId,                              //归属于
  under_type: String,                                         //归属对象类型
  reply_user: {type: Schema.ObjectId, ref: 'User'},           //回复用户
  star_score: {type: Number, default: 0},                     //分数
  star_count: {type: Number, default: 0}                      //打分次数
});

let method = {
  * updateStar (comment, score) {
    if (comment && comment.id && score) {
      let body = {
        star_score: ((comment.star_score || 0) * (comment.star_count || 0) + score ) / ((comment.star_count||0) + 1),
        star_count: (comment.star_count || 0) + 1
      }
      return yield this.findOneAndUpdate({_id: comment.id}, {$set: body});
    }
  },

  * findByPageUnderObject (page, under_type, under_object, select) {//, user_populate
    if (page && under_type && under_object) {
      let query = {created_at:{}, under_object, under_type};
      if (page.lastime) {
        Object.assign(query.created_at, {$lt: page.lastime});
      }
      if (page.firstime) {
        Object.assign(query.created_at, {$gt: page.firstime});
      }
      // let populate;
      // if (user_populate) {
      //   populate = user_populate;
      // } else {
      //   populate = [{
      //     path: "creater",
      //     select: Constants.UserPopulateSelect
      //   },{
      //     path: "reply_user",
      //     select: Constants.UserPopulateSelect
      //   }];
      // }
      let results =  yield this.find(query).skip(page.offset).limit(page.size)//.populate(populate);
      results.forEach((e,i,a) => {
        a[i] = e.toObject();
      });
      if (select) {
        Utils.selected(results, select);
      }
      return results;
    }
  }
};

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Comment", DocSchema, "Comment")
