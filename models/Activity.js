const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

mounts.findActMonHot = function* (de, to) {
  let execute = this.aggregate([
    {$match: {actday: {$gte: new Date(de), $lte: new Date(to)}}},
    {$sort: {favor: -1}},
    {$group: {_id: "$actday", sub: {$first : "$$ROOT"}}},
    {$project: {_id: 0, sub: 1}}
  ]);
  return yield execute.exec();
}





mounts.findActDayPage = function* (day, query) {
  let {page, size, offset, sort, order} = query;
  let gteDay = new Date(day);
  let lteDayTmp = new Date(day);
  let lteDay = lteDayTmp.setDate(gteDay.getDate() + 1);
  let execute = this.find({actday: {$gte: gteDay, $lte: lteDay}})
                .skip(offset + (page - 1) * size)
                .limit(size)
                .sort({}[sort] = order).populate("sub");
  return yield execute.exec();
}

mounts.findActTag = function* (actid, acttag) {
  let execute = this.find({_id: {$eq: actid}}).elemMatch("tags", {tag: { $eq: acttag}});
  return yield execute.exec();
}

mounts.updateActSub = function* (actid, subid) {
  return yield this.update({_id: actid}, {$set:{sub: subid}});
}

mounts.updateActFavor = function* (actid) {
  //更新sub的favor时更新相应的act的favor
  return yield this.update({_id: actid}, {$inc: {favor: 1}});
}

mounts.updateActTag = function* (actid, acttag) {
  //更新sub关联的act的tag
  return yield this.update({_id: actid},{$push: {tags: {tag: acttag}}});
}

mounts.updateActTagFavor = function* (actid, acttag) {
  //更新sub管理的act的tag的favor, 标签被赞
  return yield this.update({_id: actid, "tags.tag": acttag}, {$inc: {"tags.$.like": 1}});
}

mounts.findActivitys = function* (body) {
  return yield this.find(body || {});
}

mounts.findActivity = function* (body) {
  return yield this.findOne(body || {});
}

mounts.findActivityById = function* (id) {
  return yield this.findOne({_id: id});
}


module.exports = mongoose.model('Activity', ActivitySchema, 'Activity');
