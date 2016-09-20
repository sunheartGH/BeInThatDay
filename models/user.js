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

module.exports = mongoose.model('User', UserSchema, 'users');
