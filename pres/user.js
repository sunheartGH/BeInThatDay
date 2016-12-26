const {AppInfo, Codes, Schemas, Constants} = require('../utils');
const {User} = require('../models');
const validator = require('validator');

module.exports = class user {
  constructor () {}

  * newUser (next) {
    //注册新用户
    let {nickname, username, email, phone, password} = this.request.body;
    if (nickname) {
      if (typeof nickname != "string" || !Constants.nicknameRgx.test(nickname)) {
        this.body = AppInfo.Msg("nickname wrong format", Codes.User.NICKNAME_TYPE);
        return;
      }
    } else {
      this.body = AppInfo.Msg("nickname not exist", Codes.User.NICKNAME_NULL);
      return;
    }
    if (username || email || phone) { //验证账号存在
      if (username && (typeof username != "string" || (!Constants.usernameRgx.test(username) || Constants.sensitiveChars.includes(username)))) { //验证用户名格式，和敏感字符
        this.body = AppInfo.Msg("wrong username format", Codes.User.USERNAME_TYPE);
        return;
      }
      if (email && (typeof email != "string" || !validator.isEmail(email))) { //验证邮箱格式
        this.body = AppInfo.Msg("wrong email format", Codes.User.EMAIL_TYPE);
        return;
      }
      if (phone && (typeof phone != "string" || !validator.isMobilePhone(phone, "zh-CN"))) { //验证手机号
        this.body = AppInfo.Msg("wrong phone format", Codes.User.PHONE_TYPE);
        return;
      }
    } else {
      this.body = AppInfo.Msg("no available account", Codes.Common.NO_ACCOUNT);
      return;
    }
    if (password) { //验证密码存在
      if (typeof password == "string" && Constants.passwordRgx.test(password)) {
        //执行业务
        yield next;
      } else {
        this.body = AppInfo.Msg("password wrong format", Codes.Common.PASSWORD_TYPE);
      }
    } else {
      this.body = AppInfo.Msg("password not exist", Codes.User.PASSWORD_NULL);
    }
  }

  * showUser (next) {
    //uid 格式判断
    let {uid} = this.params;

    if (!Schemas.ObjectIdValid(uid)) {
      this.body = AppInfo.Msg("user id must be objectid string", Codes.User._ID_DATA);
      return;
    }

    yield next;
  }

  * modifyUser (next) {
    //修改参格式数判断
    let {nickname,gender,avatar,home,depict,tags} = this.request.body;
    //nickname 数据与长度判断
    if (nickname) {
      if (typeof nickname != "string") {
        this.body = AppInfo.Msg("nickname must be string", Codes.User.NICKNAME_TYPE);
        return;
      }
      if (!Constants.nicknameRgx.test(nickname)) {
        this.body = AppInfo.Msg("nickname contain illegal chars", Codes.User.NICKNAME_DATA);
        return;
      }
    }
    //gender 数据判断
    if (gender) {
      if (!Constants.UserGender[gender]) {
        this.body = AppInfo.Msg("gender is wrong", Codes.User.GENDER_DATA);
        return;
      }
    }

    //avatar, home 为url
    if (avatar && (typeof avatar != 'string' || !validator.isURL(avatar))) {
      this.body = AppInfo.Msg("avatar must be url", Codes.User.AVATAR_DATA);
      return;
    }
    if (home && (typeof home != 'string' || !validator.isURL(home))) {
      this.body = AppInfo.Msg("home must be url", Codes.User.HOME_DATA);
      return;
    }
    //depict 数据与长度判断
    if (depict) {
      if (typeof depict != "string") {
        this.body = AppInfo.Msg("depict must be string", Codes.User.DEPICT_TYPE);
        return;
      }
      if (depict.length < 8 || depict.length > 256) {
        this.body = AppInfo.Msg("depict length is unlegal", Codes.User.DEPICT_DATA);
        return;
      }
    }

    //tags
    if (tags) {
      if (!Array.isArray(tags)) {
        this.body = AppInfo.Msg("tags should be Array type", Codes.User.TAGS_TYPE);
        return;
      }
      for (let tag of tags) {
        if (!Schemas.ObjectIdValid(tag)) {
          this.body = AppInfo.Msg("tags elements must be objectid string", Codes.User.TAGS_DATA);
          return;
        }
      }
    }

    yield next;
  }

  * showRelationUsers (next) {
    let {rtype} = this.params;
    if (typeof rtype == "string") {
      rtype = rtype.charAt(0).toUpperCase() + rtype.slice(1);
      if (!Constants.RelateType[rtype]) {
        this.body = AppInfo.Msg("relate_type is unlegal", Codes.Relation.RELATE_TYPE_DATA);
        return;
      }
      this.params.rtype = rtype;
    } else {
      this.body = AppInfo.Msg("relate_type must be string", Codes.Relation.RELATE_TYPE_TYPE);
      return;
    }
    yield next
  }
};
