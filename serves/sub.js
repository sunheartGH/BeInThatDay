let Sub = require('../models').Sub;

module.exports = class sub {
  constructor () {}

  * addSub (user, actid) {
    //添加sub时添加act作关联，并关联user
    let subEntity = new Sub({creater: user, act: actid});
    let result = yield subEntity.save();
    return result;
  }

  * findSub (subid) {
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
    let result = yield execute.exec();
    return result;
  }

  * findUserSub (user, subid) {
    //查询具体的某个sub
    let execute = Sub.find({"creater": {$eq: user}, "source": {$eq: subid}});
    let result = yield execute.exec();
    return result;
  }

  * findSubJust (subid) {
    //查询具体的某个sub
    let execute = Sub.find({"_id": {$eq: subid}});
    let result = yield execute.exec();
    return result;
  }

  * findUserMonHot (userid, de, to) {
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
    let result = yield execute.exec();
    return result;
  }

  * findUserDayPage (day, userid, query) {
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

  * updateSub () {
    //更新sub信息，更新关联的act信息
  }

  * setSubSource (subid, sourceid) {
    //更新sub的origin字段数据，使其关联其他sub或自己，以此判断是否是原创
    let result = yield Sub.update({_id: subid}, {$set:{'source': sourceid}});
    return result;
  }

  * updateSubComments (sub, commentid) {
    //更新sub关联的act的tag
    let result = yield Sub.update({_id: sub}, {$push: {comments: commentid}});
    return result;
  }

  * updateSubFavor (subid) {
    //用户收藏sub
    //更新某个sub的favor
    let result = yield Sub.update({_id: subid}, {$inc: {'favor': 1}});
    return result;
  }
};
