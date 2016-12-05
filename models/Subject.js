const mongoose= require( 'mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Relation = require('./Relation.js');
const Constants = require('../utils/Constants.js');
const Utils = require('../utils/Utils.js');

let DocSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},                                //创建者id
  created_at: {type: Date, default: Date.now},                                  //创建日期
  updated_at: {type: Date, default: Date.now},                                  //更新日期
  refer_type: String,                                                           //引用类型
  refer_object: Schema.ObjectId,                                                //引用对象
  expose_level: {type: String, default: Constants.ExposeLevel.Public},          //公开级别 Public, Coterie, Friend, Private
  star_score: {type: Number, default: 0},                                       //分数
  star_count: {type: Number, default: 0},                                       //打分次数
  comment_count: {type: Number, default: 0},                                    //评论次数
  favorite_count: {type: Number, default: 0},                                   //收藏次数
});

let method = {
  * findByIdTakeRef (subid, refname, query, select) {
    if (subid && refname) {
      if (query) {
        query._id = subid;
        query.refer_type = refname;
      } else {
        query = {_id: subid, refer_type: refname}
      }
      let populate = {
        path: "refer_object",
        model: refname
      }
      let result = yield this.findOne(query).populate(populate);
      result = result.toObject();
      if (select) {
        Utils.selected(result, {refer_object:select});
      }
      return result;
    }
  },

  * findByRefObject (ref, refname, query, select) {
    if (ref && refname) {
      if (query) {
        query.refer_object = ref;
        query.refer_type = refname;
      } else {
        query = {refer_object: subid, refer_type: refname};
      }
      let results;
      if (select && select.refer_object) {
        let populate = {
          path: "refer_object",
          model: refname
        }
        results = yield this.find(query).populate(populate);
        Utils.selected(results, {refer_object:select});
      } else {
        results = yield this.find(query);
      }
      results.forEach((e,i,a) => {
        a[i] = e.toObject();
      });
      return results;
    }
  },

  * findByPageTakeRef (page, refname, uid, select) {
    if (page && refname) {
      let query = {created_at:{}, refer_type: refname};
      if (page.lastime) {
        Object.assign(query.created_at, {$lt: page.lastime});
      }
      if (page.firstime) {
        Object.assign(query.created_at, {$gt: page.firstime});
      }
      if (uid) {
        query.creater = mongoose.Types.ObjectId(uid.toString());
      }
      let results
      if (select && select.refer_object) {
        let populate = {
          path: "refer_object",
          model: refname
        }
        results = yield this.find(query).skip(page.offset).limit(page.size).populate(populate);
        Utils.selected(results, {refer_object:select});
      } else {
        results = yield this.find(query).skip(page.offset).limit(page.size);
      }
      results.forEach((e,i,a) => {
        a[i] = e.toObject();
      });
      return results;
    }
  },

  * findByIdOnExpose (id, curuid, refname, select) {//, user_populate
    if (id && curuid && refname) {
      let relname = Relation.modelName;
      let aggregate = [
        {$lookup: {from: relname, localField: "creater", foreignField: "relate_user", as: "relate_user"}},
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
      if (select && select.refer_object) {
        aggregate.unshift({$unwind : "$refer_object" });
        aggregate.unshift({$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}});
      }
      aggregate.unshift({$match: {_id: mongoose.Types.ObjectId(id.toString()), refer_type: refname}})

      let project = {
        $project: {_id: 1,id:"$_id",creater: 1,created_at: 1,updated_at: 1,refer_type: 1,
          refer_object: 1,expose_level: 1,star_score: 1,star_count: 1,comment_count: 1,
          favorite_count: 1,__v : 1
        }
      }

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
      // }
      aggregate.push(project);

      let results = yield this.aggregate(aggregate).exec();
      if (select) {
        select.relate_user = 0
        Utils.selected(results, select);
      } else {
        Utils.selected(results, {relate_user:0});
      }
      if (results && results.length) {
        return results[0];
      } else {
        return results;
      }
    }
  },

  * updateStar (subject, score) {
    if (subject && subject.id && score) {
      let body = {
        star_score: ((subject.star_score || 0) * (subject.star_count || 0) + score) / ((subject.star_count||0) + 1),
        star_count: (subject.star_count || 0) + 1
      }
      return yield this.findOneAndUpdate({_id: subject.id}, {$set: body});
    }
  }
}

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Subject", DocSchema, "Subject")
