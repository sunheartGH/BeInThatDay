const mongoose= require( 'mongoose');
const Schema = mongoose.Schema;

let SubjectSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  refer_type: String,                                         //引用类型
  refer: Schema.ObjectId,                                     //引用对象
  expose_level: {type: String, default: "Public"},            //公开级别 Public, Coterie, Friend, Private
  star_score: {type: Number, default: 0},                     //分数
  star_count: {type: Number, default: 0},                     //打分次数
  comment_count: {type: Number, default: 0}                   //评论次数
});


SubjectSchema.statics.saveSub = function* (user, actid) {
  //添加sub时添加act作关联，并关联user
  let entity = new Subject({creater: user, act: actid});
  return yield entity.save();
}

SubjectSchema.statics.findSub = function* (subid) {
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

SubjectSchema.statics.findUserSub = function* (user, subid) {
  //查询具体的某个sub
  let execute = Subject.find({"creater": {$eq: user}, "source": {$eq: subid}});
  return yield execute.exec();
}

SubjectSchema.statics.findSubJust = function* (subid) {
  //查询具体的某个sub
  let execute = Subject.find({"_id": {$eq: subid}});
  return yield execute.exec();
}

SubjectSchema.statics.findUserMonHot = function* (userid, de, to) {
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

SubjectSchema.statics.findUserDayPage = function* (day, userid, query) {
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

SubjectSchema.statics.updateSubSource = function* (subid, sourceid) {
  //更新sub的origin字段数据，使其关联其他sub或自己，以此判断是否是原创
  return yield Subject.update({_id: subid}, {$set:{'source': sourceid}});
}

SubjectSchema.statics.updateSubComments = function* (sub, commentid) {
  //更新sub关联的act的tag
  return yield Subject.update({_id: sub}, {$push: {comments: commentid}});
}

SubjectSchema.statics.updateSubFavor = function* (subid) {
  //用户收藏sub
  //更新某个sub的favor
  return yield Subject.update({_id: subid}, {$inc: {'favor': 1}});
}



module.exports = mongoose.model('Subject', SubjectSchema, 'Subject');
