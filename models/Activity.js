const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Subject = require('./Subject.js');
const Relation = require('./Relation.js');
const Constants = require('../utils/Constants.js');
const Utils = require('../utils/Utils.js');

let DocSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id                                         //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  title: String,                                              //标题
  cover_picurl: String,                                       //封面图片地址
  summary: String,                                            //摘要内容
  content: String,                                            //内容
  site: String,                                               //导航地址
  start_time: Date,                                           //活动开始时间
  end_time: Date,                                             //结束时间
  fee: Number,                                                //费用
  location: {type: Schema.ObjectId, ref: 'Location'},         //活动地点
  tags: [{type: Schema.ObjectId, ref: 'Tag'}],                //标签
});

//TODO 聚合去重？？

let method = {
  * findStartTimePage (page, select) {//, user_populate
    if (page) {
      let refname = this.modelName;
      let rs = {};
      if (page.lastime) {
        Object.assign(rs, {$lte: page.lastime});
      }
      if (page.firstime) {
        Object.assign(rs, {$gte: page.firstime});
      }
      let aggregate = [
        {$match: {expose_level: Constants.ExposeLevel.Public, refer_type: refname}},
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$unwind : "$refer_object" },
        {$match: {"refer_object.start_time": rs}},
        {$sort: {favorite_count: -1, "refer_object.created_at": -1}},
        {$skip : page.offset},
        {$limit : page.size},
      ];
      let project = {$project: {
        _id: 1,id:"$_id",creater: 1,created_at: 1,updated_at: 1,refer_type: 1,expose_level: 1,
        star_score: 1,star_count: 1,comment_count: 1,favorite_count: 1,__v : 1,
        refer_object: {
          creater: 1,title: 1,cover_picurl: 1,start_time: 1,
          end_time: 1,summary: 1,fee: 1,
          location: 1,tags: 1,
        }
      }}
      // if (user_populate) {
      //   if (user_populate.creater) {
      //     aggregate.push(
      //       {"$lookup":{"from":"User","localField":"creater","foreignField":"_id","as":"creater"}},
      //       {"$unwind":"$creater"}
      //     )
      //     project.$project.creater = {
      //       _id:1,id:"$creater._id",username:1, nickname:1, avatar:1,
      //     }
      //   }
      //   if (user_populate.refer_object&&user_populate.refer_object.creater) {
      //     aggregate.push(
      //       {"$lookup":{"from":"User","localField":"refer_object.creater","foreignField":"_id","as":"refer_object.creater"}},
      //       {"$unwind":"$refer_object.creater"}
      //     )
      //     project.$project.refer_object.creater = {
      //       _id:1,id:"$refer_object.creater._id",username:1, nickname:1, avatar:1,
      //     }
      //   }
      // }
      aggregate.push(project);
      let results = yield Subject.aggregate(aggregate).exec();
      if (select) {
        Utils.selected(results, {refer_object:select});
      }
      return results;
    }
  },

  * findStartTimeCalendar (from, until, select) {
    //查询 Activity start_time 区间
    if (from && until) {
      let refname = this.modelName;
      let aggregate = [
        {$match: {expose_level: Constants.ExposeLevel.Public, refer_type: refname}},
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$unwind : "$refer_object" },
        {$match: {"refer_object.start_time": {$gte: new Date(from), $lte: new Date(until)}}},
        {$sort: {favorite_count: -1, "refer_object.created_at": -1}},
        {$group: {_id: "$refer_object.start_time", activity: {$first : "$$ROOT"}}},
        {$project: {
          _id: 0,
          activity: {
            _id: 1,id:"$_id",creater: 1,created_at: 1,updated_at: 1,refer_type: 1,expose_level: 1,
            star_score: 1,star_count: 1,comment_count: 1,favorite_count: 1,__v : 1,
            refer_object: {
              title: 1,cover_picurl: 1,start_time: 1,
            }
          }
        }}
      ];
      let activitys = yield Subject.aggregate(aggregate).exec();
      let results = [];
      for (let activity of activitys) {
        results.push(activity.activity);
      }
      if (select) {
        Utils.selected(results, {refer_object:select});
      }
      return results;
    }
  },

  * findStartTimePageOnExpose (page, curuid, uid, select) {//, user_populate
    if (page) {
      let refname = this.modelName;
      let relname = Relation.modelName;
      let rs = {};
      if (page.lastime) {
        Object.assign(rs, {$lte: page.lastime});
      }
      if (page.firstime) {
        Object.assign(rs, {$gte: page.firstime});
      }
      let aggregate = [
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$lookup: {from: relname, localField: "creater", foreignField: "relate_user", as: "relate_user"}},
        {$unwind : "$refer_object" },
        {$match: {"refer_object.start_time": rs}},
        {$match: {$or:[
          {creater: mongoose.Types.ObjectId(curuid.toString())},
          {expose_level: Constants.ExposeLevel.Public},
          {
            expose_level: Constants.ExposeLevel.Coterie,
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
            expose_level: Constants.ExposeLevel.Friend,
            relate_user:{
              $elemMatch: {
                creater: mongoose.Types.ObjectId(curuid.toString()),
                relate_type: Constants.RelateType.Friend,
                relate_state: Constants.RelateState.Bilateral
              }
            }
          }
        ]}},
        {$sort: {favorite_count: -1, "refer_object.created_at": -1}},
        {$skip : page.offset},
        {$limit : page.size},
      ];
      if (uid) {
        aggregate.unshift({$match: {creater: mongoose.Types.ObjectId(uid.toString()), refer_type: refname}});
      } else {
        aggregate.unshift({$match: {refer_type: refname}});
      }

      let project = {$project: {
        _id: 1,id:"$_id",creater: 1,created_at: 1,updated_at: 1,refer_type: 1,expose_level: 1,
        star_score: 1,star_count: 1,comment_count: 1,favorite_count: 1,__v : 1,
        refer_object: {
          creater: 1,title: 1,cover_picurl: 1,start_time: 1,
          end_time: 1,summary: 1,fee: 1,
          location: 1,tags: 1,
        }
      }}
      // if (user_populate) {
      //   if (user_populate.creater) {
      //     aggregate.push(
      //       {"$lookup":{"from":"User","localField":"creater","foreignField":"_id","as":"creater"}},
      //       {"$unwind":"$creater"}
      //     )
      //     project.$project.creater = {
      //       _id:1,id:"$creater._id",username:1, nickname:1, avatar:1,
      //     }
      //   }
      //   if (user_populate.refer_object&&user_populate.refer_object.creater) {
      //     aggregate.push(
      //       {"$lookup":{"from":"User","localField":"refer_object.creater","foreignField":"_id","as":"refer_object.creater"}},
      //       {"$unwind":"$refer_object.creater"}
      //     )
      //     project.$project.refer_object.creater = {
      //       _id:1,id:"$refer_object.creater._id",username:1, nickname:1, avatar:1,
      //     }
      //   }
      // }
      aggregate.push(project);

      let results = yield Subject.aggregate(aggregate).exec();
      if (select) {
        Utils.selected(results, {relate_user: 0, refer_object:select});
      } else {
        Utils.selected(results, {relate_user:0});
      }
      return results;
    }
  },

  * findStartTimeCalendarOnExpose (from, until, curuid, uid, select) {
    //查询 Activity start_time 区间
    if (from && until && curuid) {
      let refname = this.modelName;
      let relname = Relation.modelName;
      let aggregate = [
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$lookup: {from: relname, localField: "creater", foreignField: "relate_user", as: "relate_user"}},
        {$unwind : "$refer_object" },
        {$match: {$or:[
          {"creater": mongoose.Types.ObjectId(curuid.toString())},
          {expose_level: Constants.ExposeLevel.Public},
          {
            expose_level: Constants.ExposeLevel.Coterie,
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
            expose_level: Constants.ExposeLevel.Friend,
            relate_user:{
              $elemMatch: {
                creater: mongoose.Types.ObjectId(curuid.toString()),
                relate_type: Constants.RelateType.Friend,
                relate_state: Constants.RelateState.Bilateral
              }
            }
          }
        ]}},
        {$match: {"refer_object.start_time": {$gte: new Date(from), $lte: new Date(until)}}},
        {$sort: {favorite_count: -1, "refer_object.created_at": -1}},
        {$group: {_id: "$refer_object.start_time", activity: {$first : "$$ROOT"}}},
        {$project: {
          _id: 0,
          activity: {
            _id: 1,id:"$_id",creater: 1,created_at: 1,updated_at: 1,refer_type: 1,expose_level: 1,
            star_score: 1,star_count: 1,comment_count: 1,favorite_count: 1,__v : 1,
            refer_object: {
              title: 1,cover_picurl: 1,start_time: 1,
            }
          }
        }}
      ];
      if (uid) {
        aggregate.unshift({$match: {creater: mongoose.Types.ObjectId(uid.toString()), refer_type: refname}});
      } else {
        aggregate.unshift({$match: {refer_type: refname}});
      }
      let activitys = yield Subject.aggregate(aggregate).exec();
      let results = [];
      for (let activity of activitys) {
        results.push(activity.activity);
      }
      if (select) {
        Utils.selected(results, {relate_user:0, refer_object:select});
      } else {
        Utils.selected(results, {relate_user:0});
      }
      return results;
    }
  }
}

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Activity", DocSchema, "Activity")
