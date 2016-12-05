const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const base = require('./base.js');
const Utils = require('../utils/Utils.js');

let DocSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  longitude: Number,                                          //经度
  latitude: Number,                                           //纬度
  country: String,                                            //国家
  state: String,                                              //州
  province: String,                                           //省
  city: String,                                               //城市
  address: String,                                            //详细地址
});

let method = {

};

Object.assign(DocSchema.statics, base, method);
module.exports = mongoose.model("Location", DocSchema, "Location")
