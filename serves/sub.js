let Sub = require('../models').Sub;

module.exports = class sub {
  constructor () {}

  * addSub () {
    //添加sub时添加act作关联，并关联user
    let subEntity = new Sub({creater: this.session.user, act: this.state.actid});
    let result = yield subEntity.save();
    return result;
  }

  * findSub () {
    //查询具体的某个sub，关联act, 并查询comment
    let subid = this.params.id;
    let execute = Sub.find({"_id": {$eq: subid}}).populate({
                    path: 'act'
                  }).populate({
                    path: 'comments',
                    options: {
                      sort: {favor: -1},
                      limit: 5
                    }
                  });
    let result = yield execute.exec();
    return result;
  }

  * findUserSub () {
    //查询具体的某个sub
    let execute = Sub.find({"creater": {$eq: this.session.user}, "source": {$eq: this.state.subid}});
    let result = yield execute.exec();
    return result;
  }

  * findSubJust () {
    //查询具体的某个sub
    let subid = this.state.subid;
    let execute = Sub.find({"_id": {$eq: subid}});
    let result = yield execute.exec();
    return result;
  }

  * findUserMonHot () {
    //查询User的某月日历
    let userid = this.state.userid;
    let {de, to} = this.query;
    let execute = Sub.aggregate([
      {$match: {creater: {$eq: userid}}},
      {$lookup: {from: "acts", localField: "act", foreignField: "_id", as: "act"}},
      {$unwind : "$act" },
      {$match: {"act.actday": {$gte: new Date(de), $lte: new Date(to)}}},
      {$sort: {"like": -1}},
      {$group: {_id: "$act.actday", sub: {$first : "$$ROOT"}}},
      {$project: {_id: 0, sub: 1}}
    ]);
    let result = yield execute.exec();
    return result;
  }

  * findUserDayPage () {
    //查询User的某天的日历项，做最热/最新排序
    let day = this.params.day;
    let userid = this.state.userid;
    let {page, size, offset, sort, order} = this.query;
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

  * updateSub () {
    //更新sub信息，更新关联的act信息
  }

  * setSubSource () {
    //更新sub的origin字段数据，使其关联其他sub或自己，以此判断是否是原创
    let {subid, sourceid} = this.state;
    let result = yield Sub.update({_id: subid}, {$set:{'source': sourceid}});
    return result;
  }

  * updateSubComments () {
    //更新sub关联的act的tag
    let sub = this.request.body.sub;
    let commentid = this.state.commentid;
    let result = yield Sub.update({_id: sub}, {$push: {comments: commentid}});
    return result;
  }

  * updateSubLike () {
    //用户收藏sub
    //更新某个sub的favor,并更新act的favor
    let subid= this.state.subid;
    let result = yield Sub.update({_id: subid}, {$inc: {'favor': 1}});
    return result;
  }
};
