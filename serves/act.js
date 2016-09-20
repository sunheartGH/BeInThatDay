let Act = require('../models').Act,
    AppInfo = require('../utils/AppInfo');

module.exports = class act {
  constructor () {}

  * addAct (user, body) {
    let {title, post, actday} = body;
    let actEntity = new Act({author: user, title: title, post: post, actday: actday});
    let result = yield actEntity.save();
    return result;
  }

  * findActMonHot (de, to) {
    let execute = Act.aggregate([
      {$match: {actday: {$gte: new Date(de), $lte: new Date(to)}}},
      {$sort: {favor: -1}},
      {$group: {_id: "$actday", sub: {$first : "$$ROOT"}}},
      {$project: {_id: 0, sub: 1}}
    ]);
    let result = yield execute.exec();
    return result;
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
    let result = yield execute.exec();
    return result;
  }

  * findActTag (actid, acttag) {
    let execute = Act.find({_id: {$eq: actid}}).elemMatch("tags", {tag: { $eq: acttag}});
    let result = yield execute.exec();
    return result;
  }

  * updateAct () {
    //更新Act信息，更新关联的act信息
  }

  * setActSub (actid, subid) {
    let {actid, subid} = this.state;
    let result = yield Act.update({_id: actid}, {$set:{sub: subid}});
    return result;
  }

  * updateActFavor (actid) {
    //更新sub的favor时更新相应的act的favor
    let result = yield Act.update({_id: actid}, {$inc: {favor: 1}});
    return result;
  }


  * addActTag (actid, acttag) {
    //更新sub关联的act的tag
    let result = yield Act.update({_id: actid},{$push: {tags: {tag: acttag}}});
    return result;
  }

  * updateActTagFavor (actid, acttag) {
    //更新sub管理的act的tag的favor, 标签被赞
    let result = yield Act.update({_id: actid, "tags.tag": acttag}, {$inc: {"tags.$.like": 1}});
    return result;
  }
};
