const {AppInfo, Codes, Schemas, Constants, Cryptos} = require('../utils');
const {User, Relation, Tag} = require("../models");

module.exports = class user {
  constructor () {}

  //@route(post /user)
  //#captcha()
  * newUser () {
    let {username, email, phone, password} = this.request.body;
    //创建用户
    let account= {username, email, phone};
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
  //#mount({chunk:user,mounts:[relation,tags]});
  * showUser () {
    //显示用户信息
    let {uid} = this.params;
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

    if (tags) {
      let findTags = yield Tag.findByIds(tags, {type: User.modelName});
      if (tags.length == findTags.length) {
        yield User.updateSetDoc(this.state.user.id, {tags});
      } else {
        this.body = AppInfo.Msg("some tag not found", Codes.User.TAGS_FOUND);
        return;
      }
    }
  }

};
