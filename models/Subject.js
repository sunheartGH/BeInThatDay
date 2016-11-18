const mongoose= require( 'mongoose');
const Schema = mongoose.Schema;

let SubjectSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  refer_type: String,                                         //引用类型
  refer_object: Schema.ObjectId,                              //引用对象
  expose_level: {type: String, default: "Public"},            //公开级别 Public, Coterie, Friend, Private
  star_score: {type: Number, default: 0},                     //分数
  star_count: {type: Number, default: 0},                     //打分次数
  comment_count: {type: Number, default: 0},                  //评论次数
  favorite_count: {type: Number, default: 0},                 //收藏次数
});

let mounts = SubjectSchema.statics;

mounts.saveDoc = function* (body) {
  if (body) {
    return yield new this(body).save();
  }
}

mounts.updateCommentCount = function* (id) {
  if (id) {
    return yield this.findOneAndUpdate({_id: id}, {$inc:{comment_count: 1}});
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

mounts.findById = function* (subid) {
  if (subid) {
    return yield this.findOne({_id: subid});
  }
}

mounts.findByIdTakeRef = function* (subid, refname, select) {
  if (subid && refname) {
    let populate = {
      path: "refer_object",
      model: refname
    }
    if (select) {
      populate.select = select;
    }
    return yield this.findOne({_id: subid, refer_type: refname}).populate(populate);
  }
}

mounts.findByPageTimeTakeRef = function* (page, refname, select) {
  if (page && refname) {
    let query = {created_at:{}, refer_type: refname};
    if (page.lastime) {
      Object.assign(query.created_at, {$lt: page.lastime});
    }
    if (page.firstime) {
      Object.assign(query.created_at, {$gt: page.firstime});
    }
    let populate = {
      path: "refer_object",
      model: refname
    }
    if (select) {
      populate.select = select;
    }
    return yield this.find().skip(page.offset).limit(page.size).populate(populate);
  }
}

mounts.findForActivityInterval = function* (from, until, refname, uid) {
  //查询 Activity start_time 区间
  if (from && until && refname) {
    let aggregate = [
      {$lookup: {from: refname, localField: "refer_object", foreignField: "_id", as: "refer_object"}},
      {$unwind : "$refer_object" },
      {$match: {"refer_object.start_time": {$gte: new Date(from), $lte: new Date(until)}}},
      {$sort: {favorite_count: -1}},
      {$group: {_id: "$refer_object.start_time", activity: {$first : "$$ROOT"}}},
      {$project: {_id: 0, activity: 1}}
    ];
    if (uid) {
      aggregate.unshift({$match: {creater: mongoose.Types.ObjectId(uid), refer_type: refname}});
    } else {
      aggregate.unshift({$match: {refer_type: refname}});
    }
    let execute = this.aggregate(aggregate);
    let activitys = yield execute.exec();
    let results = [];
    for (let activity of activitys) {
      results.push(activity.activity);
    }
    return results
  }
}









mounts.findSub = function* (subid) {
  //查询具体的某个sub，关联act, 并查询comment
  let execute = Subject.find({"_id": {$eq: subid}}).populate({
                  path: 'act'
                }).populate({
                  path: 'comments',
                  options: {
                    sort: {favor: -1},
                    limit: 5
                  }
                });
  return yield execute.exec();
}

mounts.findUserSub = function* (user, subid) {
  //查询具体的某个sub
  let execute = Subject.find({"creater": {$eq: user}, "source": {$eq: subid}});
  return yield execute.exec();
}

mounts.findSubJust = function* (subid) {
  //查询具体的某个sub
  let execute = Subject.find({"_id": {$eq: subid}});
  return yield execute.exec();
}

mounts.findUserMonHot = function* (userid, de, to) {
  //查询User的某月日历
  let execute = Subject.aggregate([
    {$match: {creater: {$eq: userid}}},
    {$lookup: {from: "acts", localField: "act", foreignField: "_id", as: "act"}},
    {$unwind : "$act" },
    {$match: {"act.actday": {$gte: new Date(de), $lte: new Date(to)}}},
    {$sort: {"like": -1}},
    {$group: {_id: "$act.actday", sub: {$first : "$$ROOT"}}},
    {$project: {_id: 0, sub: 1}}
  ]);
  return yield execute.exec();
}

mounts.findUserDayPage = function* (day, userid, query) {
  //查询User的某天的日历项，做最热/最新排序
  let {page, size, offset, sort, order} = query;
  //http://mongoosejs.com/docs/populate.html
  let gteDay = new Date(day);
  let lteDayTmp = new Date(day);
  let lteDay = lteDayTmp.setDate(gteDay.getDate() + 1);
  let execute = Subject.find({"creater": {$eq: userid}}).populate({
                  path: 'act',
                  match: {"actday": {$gte: gteDay, $lte: lteDay}},
                  //select: 'title',
                  options: {
                    skip: offset + (page - 1) * size,
                    limit: 5,
                    sort: sort
                  }
                });
  let resultsTmp = yield execute.exec();
  let results = [];
  for (let result of resultsTmp) {
    if (result && result.act) {
      results.push(result);
    }
  }
  return results;
}

mounts.updateSubSource = function* (subid, sourceid) {
  //更新sub的origin字段数据，使其关联其他sub或自己，以此判断是否是原创
  return yield Subject.update({_id: subid}, {$set:{'source': sourceid}});
}

mounts.updateSubComments = function* (sub, commentid) {
  //更新sub关联的act的tag
  return yield Subject.update({_id: sub}, {$push: {comments: commentid}});
}

mounts.updateSubFavor = function* (subid) {
  //用户收藏sub
  //更新某个sub的favor
  return yield Subject.update({_id: subid}, {$inc: {'favor': 1}});
}



module.exports = mongoose.model('Subject', SubjectSchema, 'Subject');
