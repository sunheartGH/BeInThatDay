const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
  nickname: String,
  username: String,
  password: String,
  sex: String,
  email: String,
  followed: Schema.ObjectId, //follow id 关注用户列表 {_id:id,user:id,follows:[{userid:id,date:date}]}
  favored: Schema.ObjectId, //favor id 收藏sub列表 {_id:id,user:id,favors:[{subid:id,date:date}]}
  avatar: String, //头像
  home: String, //url 用户主页
  depict: String, //用户描述
  tags: Array //标签，爱好，领域等
});

module.exports = mongoose.model('User', UserSchema, 'users');
