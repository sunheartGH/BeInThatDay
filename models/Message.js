const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Utils = require('../utils/Utils.js');
const Constants = require('../utils/Constants.js');

let DocSchema = new Schema({
  receiver: {type: Schema.ObjectId, ref: 'User'},                 //消息接收者id
  sender: {type: Schema.ObjectId, ref: 'User'},                   //消息发送者id
  created_at: {type: Date, default: Date.now},                    //创建日期
  updated_at: {type: Date, default: Date.now},                    //更新日期
  type: {type: String, default: Constants.MessageType.Notice},    //消息类型，默认为通知
  state: {type: String, default: Constants.MessageState.Unread},  //消息状态，默认为未读
  title: String,                                                  //消息标题
  content_type: String,                                           //消息内容类型
  content: String,                                                //消息内容
  stuff: [{key:String,text:String,value:String}],                 //用于替换content中#key#的值
});

let method = {

};

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Message", DocSchema, "Message")
