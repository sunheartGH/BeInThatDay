const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Utils = require('../utils/Utils.js');

let UserSchema = new Schema({
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
  favor_subjects: Number,                                     //收藏subject数
  create_subjects: Number,                                    //创建subject数
  followed_count: Number,                                     //被关注数
  follow_count: Number,                                       //关注用户数
  friend_count: Number,                                       //好友数
  star_score: {type: Number, default: 0},                     //分数
  star_count: {type: Number, default: 0},                     //打分次数
  token_sign: String                                          //记录用户当前正在使用的token签名
});

let mounts = UserSchema.statics;

mounts.saveDoc = function* (account) {
  if (account) {
    return yield new this(account).save();
  }
}

mounts.findByAccount = function* (account, pw) {
  //查询某个用户的信息
  if (account.username) {
    account = {"username": account.username}
  } else if (account.email) {
    account = {"email.account": account.email}
  } else if (account.phone) {
    account = {"phone.account": account.phone}
  } else {
    account = null;
  }
  if (account) {
    if (pw) {account.password = pw;}
    return yield this.findOne(account);
  }
}

mounts.updateSetDoc = function* (id, doc) {
  if (id && doc && Object.keys(doc)) {
    doc = Utils.trimObject(doc);
    doc.updated_at = new Date();
    return yield this.findOneAndUpdate({_id: id}, {$set:doc});
  }
}

mounts.findById = function* (uid) {
  if (uid) {
    return yield this.findOne({_id: uid});
  }
}

mounts.updateStar = function* (user, score) {
  let body = {
    star_score: ((user.star_score || 0) * (user.star_count || 0) + score ) / ((user.star_count||0) + 1),
    star_count: (user.star_count || 0) + 1
  }
  return yield this.findOneAndUpdate({_id: user.id}, {$set: body});
}

module.exports = mongoose.model('User', UserSchema, 'User');
