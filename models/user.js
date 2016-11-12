const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

UserSchema.statics.findById = function* (userid) {
  return yield this.findOne({"_id": userid});
}

UserSchema.statics.findByAccount = function* (accounts, pw) {
  //查询某个用户的信息
  if (accounts.username) {
    accounts = {"username": accounts.username}
  } else if (accounts.email) {
    accounts = {"email.account": accounts.email}
  } else if (accounts.phone) {
    accounts = {"phone.account": accounts.phone}
  } else {
    accounts = null;
  }
  if (accounts) {
    if (pw) {accounts.password = pw;}
    return yield this.findOne(accounts);
  }
}

UserSchema.statics.updateSet = function* (uid, body) {
  //用户设置更新
  return yield this.findOneAndUpdate({_id: uid}, {$set: body}, {new: true});
}

UserSchema.statics.findByUsername = function* (username) {
  return yield this.findOne({"username": username});
}

UserSchema.statics.updateUserFollows = function* (userid) {
  //用户关注数
  return yield this.update({_id: userid}, {$inc: {'follows': 1}});}

UserSchema.statics.updateUserFollowed = function* (userid) {
  //用户被关注数
  return yield this.update({_id: userid}, {$inc: {'followed': 1}});
}

UserSchema.statics.updateUserFavors = function* (userid) {
  //用户收藏数
  return yield this.update({_id: userid}, {$inc: {'favors': 1}});
}


module.exports = mongoose.model('User', UserSchema, 'User');
