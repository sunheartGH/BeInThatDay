const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Utils = require('../utils/Utils.js');

let DocSchema = new Schema({
  username: String,                                           //用户名，可以作为账号
  password: String,                                           //密码，密文保存
  email: {                                                    //邮箱，可以作为账号
    account: String,
    validate: {type: Boolean, default: false}
  },
  phone: {                                                    //手机号，可以作为账号
    account: String,
    validate: {type: Boolean, default: false}
  },
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  nickname: String,                                           //昵称
  gender: String,                                             //性别
  avatar: String,                                             //头像
  home: String,                                               //url 用户主页
  depict: String,                                             //用户描述
  tags: [{type: Schema.ObjectId, ref: 'Tag'}],                //标签，爱好，领域等
  favor_subjects: {type: Number, default: 0},                 //收藏subject数
  create_subjects: {type: Number, default: 0},                //创建subject数
  followed_count: {type: Number, default: 0},                 //被关注数
  follow_count: {type: Number, default: 0},                   //关注用户数
  friend_count: {type: Number, default: 0},                   //好友数
  star_score: {type: Number, default: 0},                     //分数
  star_count: {type: Number, default: 0},                     //打分次数
  token_sign: String                                          //记录用户当前正在使用的token签名
});

let method = {
  * findByAccount (account, pw) {
    //查询某个用户的信息
    let query = {};
    let accounts = [];
    if (account.username) {
      accounts.push({"username": account.username});
    } else if (account.email) {
      accounts.push({"email.account": account.email});
    } else if (account.phone) {
      accounts.push({"phone.account": account.phone});
    } else {
      account = null;
    }
    query.$or = accounts;
    if (Object.keys(query).length) {
      if (pw) {query.password = pw;}
      return yield this.findOne(query);
    }
  },

  * updateStar (user, score) {
    let body = {
      star_score: ((user.star_score || 0) * (user.star_count || 0) + score ) / ((user.star_count||0) + 1),
      star_count: (user.star_count || 0) + 1
    }
    return yield this.findOneAndUpdate({_id: user.id}, {$set: body});
  }
};

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("User", DocSchema, "User")
