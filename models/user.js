const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
  nickname: String,
  username: String,
  password: String,
  sex: String,
  email: String,
  avatar: String, //头像
  home: String, //url 用户主页
  depict: String, //用户描述
  tags: Array, //标签，爱好，领域等
  followed: Number, //被关注数
  favors: Number, //收藏sub数
  follows: Number //关注用户数
});

let User = mongoose.model('User', UserSchema, 'users');

UserSchema.statics.saveUser = function* (body) {
  //注册时添加用户
  let userEntity = new User(body);
  return yield userEntity.save();
}

UserSchema.statics.findById = function* (userId) {
  return yield User.findOne({"_id": userId});
}

UserSchema.statics.findByVerify = function* (username, password) {
  //查询某个用户的信息
  return yield User.findOne({"username": username, "password": password});
}

UserSchema.statics.findByUsername = function* (username) {
  return yield User.findOne({"username": username});
}

UserSchema.statics.updateUserFollows = function* (userId) {
  //用户关注数
  return yield User.update({_id: userId}, {$inc: {'follows': 1}});}

UserSchema.statics.updateUserFollowed = function* (userId) {
  //用户被关注数
  return yield User.update({_id: userId}, {$inc: {'followed': 1}});
}

UserSchema.statics.updateUserFavors = function* (userId) {
  //用户收藏数
  return yield User.update({_id: userId}, {$inc: {'favors': 1}});
}
