const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Subject = require('./Subject.js');
const Relation = require('./Relation.js');
const Tag = require('./Tag.js');
const Location = require('./Location.js');
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
  * findStartTimePage (page, query, select) {
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
        {$sort: {"refer_object._id": 1, "favorite_count": -1}},
        {$group: {_id: "$refer_object._id", activity: {$first : "$$ROOT"}}},
        {$project: {
          _id: "$activity._id",
          id:"$_id",
          creater: "$activity.creater",
          created_at: "$activity.created_at",
          updated_at: "$activity.updated_at",
          refer_type: "$activity.refer_type",
          expose_level: "$activity.expose_level",
          star_score: "$activity.star_score",
          star_count: "$activity.star_count",
          comment_count: "$activity.comment_count",
          favorite_count: "$activity.favorite_count",
          __v : "$activity.__v",
          refer_object: {
            _id: "$activity.refer_object._id",
            id: "$activity.refer_object._id",
            title: "$activity.refer_object.title",
            cover_picurl: "$activity.refer_object.cover_picurl",
            start_time: "$activity.refer_object.start_time",
            creater: "$activity.refer_object.creater",
            end_time: "$activity.refer_object.end_time",
            summary: "$activity.refer_object.summary",
            fee: "$activity.refer_object.fee",
            location: "$activity.refer_object.location",
            tags: "$activity.refer_object.tags",
          }
        }}
      ];

      if (query && query.city) {
        aggregate.push(
          {$lookup: {from: Location.modelName, localField: "refer_object.location", foreignField: "_id", as: "location_to"}},
          {$unwind : "$location_to" },
          {$match: {"location_to.city": query.city}}
        );
      }

      aggregate.push(
        {$sort: {favorite_count: -1, "refer_object.created_at": -1}},
        {$skip : page.offset},
        {$limit : page.size}
      )
      let project = {$project: {
        _id: 1,id:"$_id",creater: 1,created_at: 1,updated_at: 1,refer_type: 1,expose_level: 1,
        star_score: 1,star_count: 1,comment_count: 1,favorite_count: 1,__v : 1,
        refer_object: {
          creater: 1,title: 1,cover_picurl: 1,start_time: 1,
          end_time: 1,summary: 1,fee: 1,
          location: 1,tags: 1,
        }
      }}
      aggregate.push(project);
      let results = yield Subject.aggregate(aggregate).exec();
      if (select) {
        Utils.selected(results, {refer_object:select});
      }
      return results;
    }
  },

  * findStartTimeCalendar (from, until, query, select) {
    //查询 Activity start_time 区间
    if (from && until) {
      let refname = this.modelName;
      let aggregate = [
        {$match: {expose_level: Constants.ExposeLevel.Public, refer_type: refname}},
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$unwind : "$refer_object" },
      ];
      if (query && query.city) {
        aggregate.push(
          {$lookup: {from: Location.modelName, localField: "refer_object.location", foreignField: "_id", as: "location_to"}},
          {$unwind : "$location_to" },
          {$match: {"location_to.city": query.city}}
        );
      }

      aggregate.push(
        {$match: {"refer_object.start_time": {$gte: new Date(from), $lte: new Date(until)}}},
        {$sort: {favorite_count: -1, "refer_object.created_at": -1}},
        {$group: {_id: "$refer_object.start_time", activity: {$first : "$$ROOT"}}}, // _id:{day:{ $dayOfYear: "$refer_object.start_time"}, year: { $year: "$refer_object.start_time" }}
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
      )

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

  * findStartTimePageOnExpose (page, curuid, uid, query, select) {
    if (page && curuid) {
      let refname = this.modelName;
      let relname = Relation.modelName;
      let rs = {};
      if (page.lastime) {
        Object.assign(rs, {$lte: page.lastime});
      }
      if (page.firstime) {
        Object.assign(rs, {$gte: page.firstime});
      }

      let aggregate = [];

      if (uid) {
        aggregate.push({$match: {creater: mongoose.Types.ObjectId(uid.toString()), refer_type: refname}});
      } else {
        aggregate.push({$match: {refer_type: refname}});
      }
      aggregate.push(
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$unwind : "$refer_object" },
        {$match: {"refer_object.start_time": rs}},
        {$sort: {"refer_object._id": 1, "favorite_count": -1}},
        {$group: {_id: "$refer_object._id", activity: {$first : "$$ROOT"}}},
        {$project: {
          _id: "$activity._id",
          id:"$_id",
          creater: "$activity.creater",
          created_at: "$activity.created_at",
          updated_at: "$activity.updated_at",
          refer_type: "$activity.refer_type",
          expose_level: "$activity.expose_level",
          star_score: "$activity.star_score",
          star_count: "$activity.star_count",
          comment_count: "$activity.comment_count",
          favorite_count: "$activity.favorite_count",
          __v : "$activity.__v",
          refer_object: {
            _id: "$activity.refer_object._id",
            id: "$activity.refer_object._id",
            title: "$activity.refer_object.title",
            cover_picurl: "$activity.refer_object.cover_picurl",
            start_time: "$activity.refer_object.start_time",
            creater: "$activity.refer_object.creater",
            end_time: "$activity.refer_object.end_time",
            summary: "$activity.refer_object.summary",
            fee: "$activity.refer_object.fee",
            location: "$activity.refer_object.location",
            tags: "$activity.refer_object.tags",
          }
        }},
        {$lookup: {from: relname, localField: "creater", foreignField: "relate_user", as: "relate_user"}}
      );

      if (query && query.city) {
        aggregate.push(
          {$lookup: {from: Location.modelName, localField: "refer_object.location", foreignField: "_id", as: "location_to"}},
          {$unwind : "$location_to" },
          {$match: {"location_to.city": query.city}}
        );
      }
      aggregate.push(
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
        {$limit : page.size}
      )

      let project = {$project: {
        _id: 1,id:"$_id",creater: 1,created_at: 1,updated_at: 1,refer_type: 1,expose_level: 1,
        star_score: 1,star_count: 1,comment_count: 1,favorite_count: 1,__v : 1,
        refer_object: {
          creater: 1,title: 1,cover_picurl: 1,start_time: 1,
          end_time: 1,summary: 1,fee: 1,
          location: 1,tags: 1,
        }
      }}
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

  * findStartTimeCalendarOnExpose (from, until, curuid, uid, query, select) {
    //查询 Activity start_time 区间
    if (from && until && curuid) {
      let refname = this.modelName;
      let relname = Relation.modelName;
      let aggregate = [
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
        {$group: {_id: "$refer_object.start_time", activity: {$first : "$$ROOT"}}}, // _id:{day:{ $dayOfYear: "$refer_object.start_time"}, year: { $year: "$refer_object.start_time" }}
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
      if (query && query.city) {
        aggregate.unshift(
          {$lookup: {from: Location.modelName, localField: "refer_object.location", foreignField: "_id", as: "location_to"}},
          {$unwind : "$location_to" },
          {$match: {"location_to.city": query.city}}
        );
      }
      aggregate.unshift(
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$lookup: {from: relname, localField: "creater", foreignField: "relate_user", as: "relate_user"}},
        {$unwind : "$refer_object" }
      );

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
  },

  * findCreatedByPageOnExpose (page, curuid, uid, query, select) {
    if (page && curuid && uid) {
      let refname = this.modelName;
      let relname = Relation.modelName;
      let rs = {created_at:{}};
      if (page.lastime) {
        Object.assign(rs.created_at, {$lte: page.lastime});
      }
      if (page.firstime) {
        Object.assign(rs.created_at, {$gte: page.firstime});
      }
      rs.refer_type = refname;
      rs.creater = mongoose.Types.ObjectId(uid.toString());

      let aggregate = [];
      aggregate.push(
        {$match: rs},
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$unwind : "$refer_object" }
      );
      if (curuid.toString()!=uid.toString()) {
        aggregate.push(
          {$lookup: {from: relname, localField: "creater", foreignField: "relate_user", as: "relate_user"}},
          {$match: {$or:[
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
          ]}}
        )
      }

      if (query && query.city) {
        aggregate.push(
          {$lookup: {from: Location.modelName, localField: "refer_object.location", foreignField: "_id", as: "location_to"}},
          {$unwind : "$location_to" },
          {$match: {"location_to.city": query.city}}
        );
      }
      aggregate.push(
        {$sort: {"created_at": -1, favorite_count: -1}},
        {$skip : page.offset},
        {$limit : page.size}
      )

      let project = {$project: {
        _id: 1,id:"$_id",creater: 1,created_at: 1,updated_at: 1,refer_type: 1,expose_level: 1,
        star_score: 1,star_count: 1,comment_count: 1,favorite_count: 1,__v : 1,
        refer_object: {
          creater: 1,title: 1,cover_picurl: 1,start_time: 1,
          end_time: 1,summary: 1,fee: 1,
          location: 1,tags: 1,
        }
      }}
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

  * searchDocs (page, keyword, select) {
    if (page && keyword) {
      let refname = this.modelName;
      let relname = Relation.modelName;
      let rs = {};
      if (page.lastime) {
        Object.assign(rs, {$lte: page.lastime});
      }
      if (page.firstime) {
        Object.assign(rs, {$gte: page.firstime});
      }
      let tagIds = yield Tag.find({name:{$regex: keyword, $options:"g"}}, {_id:1}).sort({created_at: 1}).limit(100);
      tagIds = tagIds.map(e => e.id);

      // let locationIds = yield Location.find({$or:[
      //   {province:{$regex: keyword, $options:"g"}},
      //   {city:{$regex: keyword, $options:"g"}},
      //   {address:{$regex: keyword, $options:"g"}},
      // ]}, {_id:1}).sort({created_at: -1}).limit(100);
      // locationIds = locationIds.map(e => e.id);

      let aggregate = [
        {$match: {refer_type: refname, expose_level: Constants.ExposeLevel.Public}},
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$lookup: {from: relname, localField: "creater", foreignField: "relate_user", as: "relate_user"}},
        {$unwind : "$refer_object" },
        {$match: {"refer_object.created_at": rs, }},
        {$match: {$or:[
          {"refer_object.title": {$regex: keyword, $options:"g"}},
          {"refer_object.content": {$regex: keyword, $options:"g"}},
          {"refer_object.tags": {$in: tagIds}},
          // {"refer_object.location": {$in: locationIds}},
        ]}},
        {$sort: {favorite_count: -1, "refer_object.created_at": -1}},
        {$skip : page.offset},
        {$limit : page.size},
        {$project: {
          _id: 1,id:"$_id",creater: 1,refer_type: 1,expose_level: 1,
          refer_object: {
            creater: 1,title: 1,summary: 1,tags: 1,
          }
        }}
      ];

      let results = yield Subject.aggregate(aggregate).exec();
      if (select) {
        Utils.selected(results, {relate_user: 0, refer_object:select});
      } else {
        Utils.selected(results, {relate_user:0});
      }
      return results;
    }
  },

  * searchDocsOnExpose (page, curuid, keyword, select) {
    if (page && curuid && keyword) {
      let refname = this.modelName;
      let relname = Relation.modelName;
      let rs = {};
      if (page.lastime) {
        Object.assign(rs, {$lte: page.lastime});
      }
      if (page.firstime) {
        Object.assign(rs, {$gte: page.firstime});
      }
      let tagIds = yield Tag.find({name:{$regex: keyword, $options:"g"}}, {_id:1}).sort({created_at: 1}).limit(100);
      tagIds = tagIds.map(e => e.id);

      // let locationIds = yield Location.find({$or:[
      //   {province:{$regex: keyword, $options:"g"}},
      //   {city:{$regex: keyword, $options:"g"}},
      //   {address:{$regex: keyword, $options:"g"}},
      // ]}, {_id:1}).sort({created_at: -1}).limit(100);
      // locationIds = locationIds.map(e => e.id);

      let aggregate = [
        {$match: {refer_type: refname}},
        {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
        {$lookup: {from: relname, localField: "creater", foreignField: "relate_user", as: "relate_user"}},
        {$unwind : "$refer_object" },
        {$match: {"refer_object.created_at": rs}},
        {$match: {$or:[
          {"refer_object.title": {$regex: keyword, $options:"g"}},
          {"refer_object.content": {$regex: keyword, $options:"g"}},
          {"refer_object.tags": {$in: tagIds}},
          // {"refer_object.location": {$in: locationIds}},
        ]}},
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
        {$project: {
          _id: 1,id:"$_id",creater: 1,refer_type: 1,expose_level: 1,
          refer_object: {
            creater: 1,title: 1,summary: 1,tags: 1,
          }
        }}
      ];

      let results = yield Subject.aggregate(aggregate).exec();
      if (select) {
        Utils.selected(results, {relate_user: 0, refer_object:select});
      } else {
        Utils.selected(results, {relate_user:0});
      }
      return results;
    }
  }
}

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Activity", DocSchema, "Activity")
