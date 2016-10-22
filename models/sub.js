const mongoose= require( 'mongoose');
const Schema = mongoose.Schema;

let SubSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'}, //创建者id
  date: {type: Date, default: Date.now}, //创建日期
  favor: {type: Number, default: 0}, //收藏数
  act: {type: Schema.ObjectId, ref: "Act"}, //关联的act id
  source: {type: Schema.ObjectId, ref: 'Sub'}, //被收藏时设置为目标sub id,若此sub的id和它的source id一样，证明原创
  comments: [{type: Schema.ObjectId, ref:'Comment'}]
});

let Sub = mongoose.model('Sub', SubSchema, 'subs');

SubSchema.statics.saveSub = function* (user, actid) {
  //添加sub时添加act作关联，并关联user
  let subEntity = new Sub({creater: user, act: actid});
  return yield subEntity.save();
}

SubSchema.statics.findSub = function* (subid) {
  //查询具体的某个sub，关联act, 并查询comment
  let execute = Sub.find({"_id": {$eq: subid}}).populate({
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

SubSchema.statics.findUserSub = function* (user, subid) {
  //查询具体的某个sub
  let execute = Sub.find({"creater": {$eq: user}, "source": {$eq: subid}});
  return yield execute.exec();
}

SubSchema.statics.findSubJust = function* (subid) {
  //查询具体的某个sub
  let execute = Sub.find({"_id": {$eq: subid}});
  return yield execute.exec();
}

SubSchema.statics.findUserMonHot = function* (userid, de, to) {
  //查询User的某月日历
  let execute = Sub.aggregate([
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

SubSchema.statics.findUserDayPage = function* (day, userid, query) {
  //查询User的某天的日历项，做最热/最新排序
  let {page, size, offset, sort, order} = query;
  //http://mongoosejs.com/docs/populate.html
  let gteDay = new Date(day);
  let lteDayTmp = new Date(day);
  let lteDay = lteDayTmp.setDate(gteDay.getDate() + 1);
  let execute = Sub.find({"creater": {$eq: userid}}).populate({
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

SubSchema.statics.updateSubSource = function* (subid, sourceid) {
  //更新sub的origin字段数据，使其关联其他sub或自己，以此判断是否是原创
  return yield Sub.update({_id: subid}, {$set:{'source': sourceid}});
}

SubSchema.statics.updateSubComments = function* (sub, commentid) {
  //更新sub关联的act的tag
  return yield Sub.update({_id: sub}, {$push: {comments: commentid}});
}

SubSchema.statics.updateSubFavor = function* (subid) {
  //用户收藏sub
  //更新某个sub的favor
  return yield Sub.update({_id: subid}, {$inc: {'favor': 1}});
}
