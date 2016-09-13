let Act = require('../models').Act,
    AppInfo = require('../utils/AppInfo');

module.exports = class act {
  constructor () {}
  * addAct () {
    let {title, post, actday} = this.request.body;
    let actEntity = new Act({author:this.session.user, title: title, post: post, actday: actday}); //...this.request.body
    let result = yield actEntity.save();
    return result;
  }

  * findActMonHot () {
    let {de, to} = this.query;
    let execute = Act.aggregate([
      {$match: {actday: {$gte: new Date(de), $lte: new Date(to)}}},
      {$sort: {favor: -1}},
      {$group: {_id: "$actday", sub: {$first : "$$ROOT"}}},
      {$project: {_id: 0, sub: 1}}
    ]);
    let result = yield execute.exec();
    return result;
  }

  * findActDayPage () {
    let day = this.params.day;
    let userid = this.state.userid;
    let {page, size, offset, sort, order} = this.query;
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

  * findActTag () {
    let {actid, acttag} = this.state;
    let execute = Act.find({_id: {$eq: actid}}).elemMatch("tags", {tag: { $eq: acttag}});
    let result = yield execute.exec();
    return result;
  }

  * updateAct () {
    //更新Act信息，更新关联的act信息
  }

  * setActSub () {
    let {actid, subid} = this.state;
    let result = yield Act.update({_id: actid}, {$set:{sub: subid}});
    return result;
  }

  * updateActFavor () {
    //更新sub的favor时更新相应的act的favor
    let actid= this.state.actid;
    let result = yield Act.update({_id: actid}, {$inc: {favor: 1}});
    return result;
  }


  * addActTag () {
    //更新sub关联的act的tag
    let {actid, acttag} = this.state;
    let result = yield Act.update({_id: actid},{$push: {tags: {tag: acttag}}});
    return result;
  }

  * updateActTagFavor () {
    //更新sub管理的act的tag的favor, 标签被赞
    let {actid, acttag} = this.state;
    let result = yield Act.update({_id: actid, "tags.tag": acttag}, {$inc: {"tags.$.like": 1}});
    return result;
  }
};
