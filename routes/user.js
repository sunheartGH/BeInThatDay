const {AppInfo, Codes, Schemas, Constants, Cryptos, Utils} = require('../utils');
const {User, Relation, Tag} = require("../models");

function userFilter (obj) {
  let filter = {
    nickname: 1,
    gender: 1,
    avatar: 1,
    home: 1,
    depict: 1,
    tags: 1,
    favor_subjects: 1,
    create_subjects: 1,
    followed_count: 1,
    follow_count: 1,
    friend_count: 1,
    star_score: 1,
    star_count: 1,
  }
  if (obj) {
    Object.assign(filter, obj);
  }
  return filter;
}

module.exports = class user {
  constructor () {}

  //@route(post /user)
  //#captcha()
  * newUser () {
    let {nickname, username, email, phone, password} = this.request.body;
    //创建用户
    let account= {nickname, username, email, phone};
    let user = yield User.findByAccount(account); //验证用户是否重复
    if (user) {
      //已创建账号
      this.body = AppInfo.Msg("account is repeat", Codes.Common.REPEAT_ACCOUNT);
      return;
    } else {
      //添加新的用户
      user = yield User.saveDoc(account);
      let enpw = Cryptos.encryptPw(password, user.id); //加密密码
      yield User.updateSetDoc(user.id, {password: enpw}); //更新密码
      //重定向到获取token
      this.status = 307;
      this.redirect("/auth");
    }
  }

  //@route(get /user/:uid)
  //#token()
  //#mount({chunk:user,mounts:[relation,tags]})
  * showUser () {
    //显示用户信息
    let {uid} = this.params;
    let filter = userFilter();
    if (this.state.user.id.toString() == uid) {
      filter.username = 1,
      filter.email = 1;
      filter.phone = 1;
      filter.created_at = 1;
    }
    let user = yield User.findById(uid, null, filter);
    if (user) {
      this.body = AppInfo({user});
    } else {
      this.body = AppInfo.Msg("id not found", Codes.Subject._ID_FOUND);
    }
  }

  //@route(put /user/username)
  //#token()
  * modifyUserUsername () {
    //修改用户用户名，需验证，验重
  }

  //@route(put /user/password)
  //#token()
  * modifyUserPassword () {
    //修改用户密码，需验证，验重
  }

  //@route(put /user/email)
  //#token()
  * modifyUserEmail () {
    //修改用户邮箱，需验证，验重
  }

  //@route(put /user/phone)
  //#token()
  * modifyUserPhone () {
    //修改用户手机号，需验证，验重
  }

  //@route(put /user)
  //#token()
  * modifyUser () {
    //修改用户信息
    let {nickname,gender,avatar,home,depict,tags} = this.request.body;

    yield User.updateSetDoc(this.state.user.id, {nickname,gender,avatar,home,depict});

    if (tags && tags.length) {
      let findTags = yield Tag.findByIds(tags);
      if (tags.length == findTags.length) {
        yield User.updateSetDoc(this.state.user.id, {tags});
      } else {
        this.body = AppInfo.Msg("some tag not found", Codes.User.TAGS_FOUND);
        return;
      }
    }
    this.body = AppInfo({nickname,gender,avatar,home,depict,tags});
  }

  //@route(get /users/:uid/:rtype)
  //#token()
  //#mount({chunk:users,mounts:[relation,tags]})
  * showRelationUsers() {
    //显示用户好友列表，好友列表仅限当前用户自己查看
    let curuid = this.state.user.id.toString();
    let {uid, rtype} = this.params;
    let pageObj = Utils.parsePageTime(this.query);

    let relaions = [];
    let users = [];
    let query;
    let mapRelations = function (e) {return e.relate_user}
    if (rtype == Constants.RelateType.Friend && curuid == uid) {
      query = {
        creater:curuid,
        relate_type: Constants.RelateType.Friend,
        relate_state: Constants.RelateState.Bilateral,
      };
    } else if (rtype == Constants.RelateType.Follow) {
      query = {
        creater: uid,
        relate_type: Constants.RelateType.Follow,
        relate_state: Constants.RelateState.Unilateral,
      };
    } else if (rtype == Constants.RelateType.Followed) {
      query = {
        relate_user: uid,
        relate_type: Constants.RelateType.Follow,
        relate_state: Constants.RelateState.Unilateral,
      };
      mapRelations = function (e) {return e.creater}
    }
    if (query) {
      relaions = yield Relation.findByPage(pageObj, query);
    }
    if (relaions && relaions.length) {
      let userIds = relaions.map(mapRelations);
      users = yield User.findByIds(userIds, null, userFilter());
    }
    let page = pageObj.page;
    let size = 0;
    if (users && users.length) {
      size = users.length;
    } else {
      users = [];
    }
    this.body = AppInfo({page, size, users});
  }
};
