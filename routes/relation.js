const {Relation, User} = require('../models');
const {AppInfo, Codes, Constants} = require('../utils');

module.exports = class relation {
  constructor () {}

  //@route(post /relation)
  //#token()
  * handleRelation () {
    //新建关系
    let {relate_user, relate_type, relate_state} = this.request.body;
    let user = yield User.findById(relate_user);
    if (!user) {
      this.body = AppInfo.Msg("relate_user not found", Codes.Relation.RELATE_USER_FOUND);
      return;
    }
    let relate = Relation.findByRelate(this.state.user.id, relate_user, relate_type); //用户的关系
    let frelate = Relation.findByRelate(relate_user, this.state.user.id, relate_type); //对方的关系
    if (frelate && frelate.length == 1) {
      frelate = frelate[0];
    }

    let relation;
    if (relate && relate.length) {
      //存在关系
      let state;
      let fstate;
      if (relate_state == Constants.RelateState.Broken) {
        //为断开，修改状态
        if (frelate && frelate.length == 1 &&
          frelate.relate_type == Constants.RelateType.Friend) {

          //为好友关系，单向或双向都改为断开
          fstate = Constants.RelateState.Broken;
        }
        state = Constants.RelateState.Broken;
      } else {
        if (relate.relate_state != Constants.RelateState.Broken) {
          //不为断开，提示重复操作
          this.body = AppInfo.Msg("relate has been handled", Codes.Common.REPEAT_WRONG);
          return;
        } else {
          //为再次建立
          state = Constants.RelateState.Unilateral;
          if (frelate && frelate.relate_type == Constants.RelateType.Friend &&
            frelate.relate_state == Constants.RelateState.Unilateral) {

            //若是同意好友申请，双方状态都为双向
            state = Constants.RelateState.Bilateral;
            fstate = Constants.RelateState.Bilateral;
          }
        }
      }
      if (fstate) {
        yield Relation.updateSetDoc(relate_user,
          {relate_user: this.state.user.id, relate_type},
          {relate_state: fstate}
        );
      }
      relation = yield Relation.updateSetDoc(this.state.user.id,
        {relate_user, relate_type},
        {relate_state: state}
      );
    } else {
      //关系不存在
      if (relate_state == Constants.RelateState.Broken) {
        //为断开，错误提示
        this.body = AppInfo.Msg("relation not found", Codes.Relation._ID_FOUND);
        return;
      } else {
        //为建立，创建关系
        relation = {
          creater: this.state.user.id,
          relate_user,
          relate_type
        };

        if (frelate && frelate.relate_type == Constants.RelateType.Friend &&
          frelate.relate_state == Constants.RelateState.Unilateral) {

          //若是同意好友申请，双方状态都为双向
          relation.relate_state = Constants.RelateState.Bilateral;
          yield Relation.updateSetDoc(relate_user,
            {relate_user: this.state.user.id, relate_type},
            {relate_state: Constants.RelateState.Bilateral}
          );
        }
        relation = yield Relation.saveDoc(relation);
      }
    }

    let fc = 1;
    if (relation.relate_state == Constants.RelateState.Broken) {
      fc = -1;
    }
    //更新用户 followed_count,follow_count,friend_count,
    if (relation.relate_type == Constants.RelateType.Follow) {
      //更新创建者 follow_count
      yield User.updateIncDoc(relation.creater, {follow_count: fc});
      //更新被创建者 followed_count
      yield User.updateIncDoc(relation.relate_user, {followed_count: fc});
    } else if (relation.relate_type == Constants.RelateType.Friend &&
      (relation.relate_state == Constants.RelateState.Bilateral ||
       relation.relate_state == Constants.RelateState.Broken)) {

      //更新创建者 friend_count
      yield User.updateIncDoc(relation.creater, {friend_count: fc});
      //更新被创建者 friend_count
      yield User.updateIncDoc(relation.relate_user, {friend_count: fc});
    }

    //TODO 向对方用户发送消息提醒

    this.body = AppInfo({relation});
  }
};
