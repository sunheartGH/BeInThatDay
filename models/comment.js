const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Utils = require('../utils/Utils.js');
const Constants = require('../utils/Constants.js');
const Subject = require('./Subject.js');
const Relation = require('./Relation.js');

let DocSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  content: String,                                            //评论内容
  under_object: Schema.ObjectId,                              //归属于
  under_type: String,                                         //归属对象类型
  reply_comment: {type: Schema.ObjectId, ref: 'Comment'},     //回复的评论
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

  * findByPageUnderObject (page, under_type, under_object, select) {
    if (page && under_type && under_object) {
      let query = {created_at:{}, under_object, under_type};
      if (page.lastime) {
        Object.assign(query.created_at, {$lt: page.lastime});
      }
      if (page.firstime) {
        Object.assign(query.created_at, {$gt: page.firstime});
      }
      let results = yield this.find(query).skip(page.offset).limit(page.size);
      results.forEach((e,i,a) => {
        a[i] = e.toObject();
      });
      if (select) {
        Utils.selected(results, select);
      }
      return results;
    }
  },

  * countByPageUnderObject (page, under_type, under_object) {
    if (page && under_type && under_object) {
      let query = {created_at:{}, under_object, under_type};
      if (page.lastime) {
        Object.assign(query.created_at, {$lt: page.lastime});
      }
      if (page.firstime) {
        Object.assign(query.created_at, {$gt: page.firstime});
      }
      return yield this.count(query);
    }
  },

  * findCreatedByPageOnExpose (page, under_type, curuid, uid, query, select) {
    if (page && under_type && curuid && uid) {
      let rs = {created_at:{}, under_type};
      if (page.lastime) {
        Object.assign(rs.created_at, {$lt: page.lastime});
      }
      if (page.firstime) {
        Object.assign(rs.created_at, {$gt: page.firstime});
      }
      rs.creater = mongoose.Types.ObjectId(uid.toString());

      if (query) {
        Object.assign(rs, query);
      }
      let aggregate = [];

      aggregate.push({$match: rs});
      if (curuid.toString()!=uid.toString()) {
        if (under_type == Subject.modelName) {
          aggregate.push(
            {$lookup: {from: under_type, localField: "under_object", foreignField: "_id", as: "under_object_to"}},
            {$unwind : "$under_object_to" },
            {$lookup: {from: Relation.modelName, localField: "under_object_to.creater", foreignField: "relate_user", as: "relate_user"}},
            {$match: {$or:[
              {"under_object_to.creater": mongoose.Types.ObjectId(curuid.toString())},
              {"under_object_to.expose_level": Constants.ExposeLevel.Public},
              {
                "under_object_to.expose_level": Constants.ExposeLevel.Coterie,
                relate_user:{
                  $elemMatch: {
                    creater: mongoose.Types.ObjectId(curuid.toString()),
                    $or:[
                      {relate_type: Constants.RelateType.Follow, relate_state: Constants.RelateState.Unilateral},
                      {relate_type: Constants.RelateType.Friend, relate_state: Constants.RelateState.Bilateral}
                    ]
                  }
                }
              },
              {
                "under_object_to.expose_level": Constants.ExposeLevel.Friend,
                relate_user:{
                  $elemMatch: {
                    creater: mongoose.Types.ObjectId(curuid.toString()),
                    relate_type: Constants.RelateType.Friend,
                    relate_state: Constants.RelateState.Bilateral
                  }
                }
              }
            ]}}
          )
        }
      }

      aggregate.push(
        {$sort: {"created_at": -1}},
        {$skip : page.offset},
        {$limit : page.size}
      )

      if (under_type == Subject.modelName) {
        let project = {$project: {
          _id: 1,id:"$_id",creater: 1,created_at: 1,updated_at: 1,content: 1,under_object: 1,
          under_type: 1,reply_comment: 1,reply_user: 1,star_score: 1,star_count: 1
        }}
        aggregate.push(project);
      }
      let results = yield this.aggregate(aggregate).exec();
      if (select) {
        Utils.selected(results, select);
      }
      return results;
    }
  }
};

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Comment", DocSchema, "Comment")
