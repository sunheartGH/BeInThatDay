const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Utils = require('../utils/Utils.js');

let DocSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  parent: {type: Schema.ObjectId, ref: 'Tag'},                //父标签
  type: String,                                               //标签类型
  name: String,                                               //标签名
  depict: String                                              //描述
});

let method = {

};

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Tag", DocSchema, "Tag")
