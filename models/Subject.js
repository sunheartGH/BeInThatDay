const mongoose= require( 'mongoose');
const Schema = mongoose.Schema;
const Constants = require('../utils/Constants.js');
const Utils = require('../utils/Utils.js');

let SubjectSchema = new Schema({
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

let mounts = SubjectSchema.statics;

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

mounts.findByIdTakeRef = function* (subid, refname, select) {
  if (subid && refname) {
    let populate = {
      path: "refer_object",
      model: refname
    }
    let result = yield this.findOne({_id: subid, refer_type: refname}).populate(populate);
    if (select) {
      Utils.selectInDoc(result, {refer_object:select});
    }
    return result;
  }
}

mounts.findByPageTakeRef = function* (page, refname, uid, select) {
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
    let populate = {
      path: "refer_object",
      model: refname
    }
    let results = yield this.find().skip(page.offset).limit(page.size).populate(populate);
    if (select) {
      Utils.selectInDocs(results, {refer_object:select});
    }
    return results;
  }
}

mounts.updateSetDoc = function* (id, doc) {
  if (id && doc && Object.keys(doc)) {
    doc = Utils.trimObject(doc);
    doc.updated_at = new Date();
    return yield this.findOneAndUpdate({_id: id}, {$set:doc});
  }
}

mounts.updateIncDoc = function* (id, doc) {
  if (id && doc && Object.keys(doc)) {
    return yield this.findOneAndUpdate({_id: id}, {$inc:doc});
  }
}

mounts.updateStar = function* (subject, score) {
  if (subject && subject.id && score) {
    let body = {
      star_score: ((subject.star_score || 0) * (subject.star_count || 0) + score) / ((subject.star_count||0) + 1),
      star_count: (subject.star_count || 0) + 1
    }
    return yield this.findOneAndUpdate({_id: subject.id}, {$set: body});
  }
}

module.exports = mongoose.model('Subject', SubjectSchema, 'Subject');
