const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Subject = require('./Subject.js');
const Relation = require('./Relation.js');
const Constants = require('../utils/Constants.js');
const Utils = require('../utils/Utils.js');

let ActivitySchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id                                         //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  title: String,                                              //标题
  cover_picurl: String,                                       //封面图片地址
  content: String,                                            //内容
  site: String,                                               //导航地址
  start_time: Date,                                           //活动开始时间
  end_time: Date,                                             //结束时间
  fee: Number,                                                //费用
  location: {type: Schema.ObjectId, ref: 'Location'},         //活动地点
  tags: [{type: Schema.ObjectId, ref: 'Tag'}],                //标签
});

let mounts = ActivitySchema.statics;

mounts.saveDoc = function* (body) {
  if (body) {
    return yield new this(body).save();
  }
}

mounts.findById = function* (id, query, select) {
  if (id) {
    if (query) {
      query._id = id;
    } else {
      query = {_id: id};
    }
    return yield this.findOne(query, select);
  }
}

mounts.updateSetDoc = function* (id, doc) {
  if (id && doc && Object.keys(doc)) {
    doc = Utils.trimObject(doc);
    doc.updated_at = new Date();
    return yield this.findOneAndUpdate({_id: id}, {$set:doc});
  }
}
mounts.updatePushDoc = function* (id, doc) {
  if (id && doc && Object.keys(doc)) {
    doc = Utils.trimObject(doc);
    doc.updated_at = new Date();
    return yield this.findOneAndUpdate({_id: id}, {$push:doc});
  }
}

mounts.findStartTimePage = function* (page, uid, selectstr) {
  if (page) {
    let refname = this.modelName;
    let aggregate = [
      {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
      {$unwind : "$refer_object" }
    ];
    if (uid) {
      aggregate.unshift({$match: {creater: mongoose.Types.ObjectId(uid.toString()), refer_type: refname}});
    } else {
      aggregate.unshift({$match: {refer_type: refname}});
    }
    let rs = {};
    if (page.lastime) {
      Object.assign(rs, {$lte: page.lastime});
    }
    if (page.firstime) {
      Object.assign(rs, {$gte: page.firstime});
    }
    aggregate.push({$match: {"refer_object.start_time": rs}});
    aggregate.push({$sort: {favorite_count: -1, "refer_object.created_at": -1}});
    aggregate.push({$skip : page.offset});
    aggregate.push({$limit : page.size});
    let results = yield Subject.aggregate(aggregate).exec();
    if (select) {
      Utils.selectInDocs(results, {refer_object:select});
    }
    return results;
  }
}

mounts.findStartTimeCalendar = function* (from, until, uid, select) {
  //查询 Activity start_time 区间
  if (from && until) {
    let refname = this.modelName;
    let aggregate = [
      {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
      {$unwind : "$refer_object" },
      {$match: {"refer_object.start_time": {$gte: new Date(from), $lte: new Date(until)}}},
      {$sort: {favorite_count: -1, "refer_object.created_at": -1}},
      {$group: {_id: "$refer_object.start_time", activity: {$first : "$$ROOT"}}},
      {$project: {_id: 0, activity: 1}}
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
      Utils.selectInDocs(results, {refer_object:select});
    }
    return results;
  }
}

mounts.findStartTimePageOnExpose = function* (page, curuid, uid, select) {
  if (page) {
    let refname = this.modelName;
    let relname = Relation.modelName;
    let aggregate = [
      {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
      {$lookup: {from: relname, localField: "creater", foreignField: "relate_user", as: "relate_user"}},
      {$unwind : "$refer_object" },
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
    ];
    if (uid) {
      aggregate.unshift({$match: {creater: mongoose.Types.ObjectId(uid.toString()), refer_type: refname}});
    } else {
      aggregate.unshift({$match: {refer_type: refname}});
    }
    let rs = {};
    if (page.lastime) {
      Object.assign(rs, {$lte: page.lastime});
    }
    if (page.firstime) {
      Object.assign(rs, {$gte: page.firstime});
    }
    aggregate.push({$match: {"refer_object.start_time": rs}});
    aggregate.push({$sort: {favorite_count: -1, "refer_object.created_at": -1}});
    aggregate.push({$skip : page.offset});
    aggregate.push({$limit : page.size});
    aggregate.push({$project:{_id:1,creater: 1,created_at: 1,updated_at: 1,refer_type: 1,
      refer_object: 1,expose_level: 1,star_score: 1,star_count: 1,comment_count: 1,
      favorite_count: 1,__v : 1}});

    let results = yield Subject.aggregate(aggregate).exec();
    if (select) {
      Utils.selectInDocs(results, {relate_user: 0, refer_object:select});
    } else {
      Utils.selectInDocs(results, {relate_user:0});
    }
    return results;
  }
}

mounts.findStartTimeCalendarOnExpose = function* (from, until, curuid, uid, select) {
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
          _id:1,creater: 1,created_at: 1,updated_at: 1,refer_type: 1,
          refer_object: 1,expose_level: 1,star_score: 1,star_count: 1,
          comment_count: 1,favorite_count: 1,__v : 1
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
      Utils.selectInDocs(results, {relate_user:0, refer_object:select});
    } else {
      Utils.selectInDocs(results, {relate_user:0});
    }
    return results;
  }
}

module.exports = mongoose.model('Activity', ActivitySchema, 'Activity');
