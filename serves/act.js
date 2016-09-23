let Act = require('../models').Act,
    AppInfo = require('../utils/AppInfo');

module.exports = class act {
  constructor () {}

  * addAct (user, body) {
    let {title, post, actday} = body;
    let actEntity = new Act({author: user, title: title, post: post, actday: actday});
    return yield actEntity.save();
  }

  * findActMonHot (de, to) {
    let execute = Act.aggregate([
      {$match: {actday: {$gte: new Date(de), $lte: new Date(to)}}},
      {$sort: {favor: -1}},
      {$group: {_id: "$actday", sub: {$first : "$$ROOT"}}},
      {$project: {_id: 0, sub: 1}}
    ]);
    return yield execute.exec();
  }

  * findActDayPage (day, query) {
    let {page, size, offset, sort, order} = query;
    let gteDay = new Date(day);
    let lteDayTmp = new Date(day);
    let lteDay = lteDayTmp.setDate(gteDay.getDate() + 1);
    let execute = Act.find({actday: {$gte: gteDay, $lte: lteDay}})
                  .skip(offset + (page - 1) * size)
                  .limit(size)
                  .sort(sort).populate("sub");
    return yield execute.exec();
  }

  * findActTag (actid, acttag) {
    let execute = Act.find({_id: {$eq: actid}}).elemMatch("tags", {tag: { $eq: acttag}});
    return yield execute.exec();
  }

  * updateAct () {
    //更新Act信息，更新关联的act信息
  }

  * setActSub (actid, subid) {
    return yield Act.update({_id: actid}, {$set:{sub: subid}});
  }

  * updateActFavor (actid) {
    //更新sub的favor时更新相应的act的favor
    return yield Act.update({_id: actid}, {$inc: {favor: 1}});
  }

  * addActTag (actid, acttag) {
    //更新sub关联的act的tag
    return yield Act.update({_id: actid},{$push: {tags: {tag: acttag}}});
  }

  * updateActTagFavor (actid, acttag) {
    //更新sub管理的act的tag的favor, 标签被赞
    return yield Act.update({_id: actid, "tags.tag": acttag}, {$inc: {"tags.$.like": 1}});
  }
};
