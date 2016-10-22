const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ActSchema = new Schema({
  author: {type: Schema.ObjectId, ref: 'User'},
  date: {type: Date, default: Date.now},
  title: String,
  post: String,
  actday: Date,
  icon: String,
  favor: {type: Number, default: 0}, //收藏数为所有关联的sub的总数
  tags: [{tag:String, like:{type: Number, default: 0}}], //每个tag有赞数
  site: String,
  sub: {type: Schema.ObjectId, ref: 'Sub'}
});

let Act = mongoose.model('Act', ActSchema, 'acts');

ActSchema.statics.saveAct = function* (user, body) {
  let {title, post, actday} = body;
  let actEntity = new Act({author: user, title: title, post: post, actday: actday});
  return yield actEntity.save();
}

ActSchema.statics.findActMonHot = function* (de, to) {
  let execute = this.aggregate([
    {$match: {actday: {$gte: new Date(de), $lte: new Date(to)}}},
    {$sort: {favor: -1}},
    {$group: {_id: "$actday", sub: {$first : "$$ROOT"}}},
    {$project: {_id: 0, sub: 1}}
  ]);
  return yield execute.exec();
}

ActSchema.statics.findActDayPage = function* (day, query) {
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

ActSchema.statics.findActTag = function* (actid, acttag) {
  let execute = this.find({_id: {$eq: actid}}).elemMatch("tags", {tag: { $eq: acttag}});
  return yield execute.exec();
}

ActSchema.statics.updateActSub = function* (actid, subid) {
  return yield this.update({_id: actid}, {$set:{sub: subid}});
}

ActSchema.statics.updateActFavor = function* (actid) {
  //更新sub的favor时更新相应的act的favor
  return yield this.update({_id: actid}, {$inc: {favor: 1}});
}

ActSchema.statics.updateActTag = function* (actid, acttag) {
  //更新sub关联的act的tag
  return yield this.update({_id: actid},{$push: {tags: {tag: acttag}}});
}

ActSchema.statics.updateActTagFavor = function* (actid, acttag) {
  //更新sub管理的act的tag的favor, 标签被赞
  return yield this.update({_id: actid, "tags.tag": acttag}, {$inc: {"tags.$.like": 1}});
}
