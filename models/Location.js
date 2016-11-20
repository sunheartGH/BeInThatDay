let mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Utils = require('../utils/Utils.js');

let LocationSchema = new Schema({
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

let mounts = LocationSchema.statics;

mounts.saveDoc = function* (body) {
  if (body) {
    return yield new this(body).save();
  }
}

mounts.updateSetDoc = function* (id, doc) {
  if (query && doc && Object.keys(doc)) {
    doc = Utils.trimObject(doc);
    doc.updated_at = new Date();
    return yield this.findOneAndUpdate({_id: id}, {$set: doc}, {new: true});
  }
}

mounts.findById = function* (id, query, select) {
  if (id) {
    if (query) {
      query._id = id;
    } else {
      query = {_id: id};
    }
    return yield this.findOne(query, select);
  }
}

module.exports = mongoose.model('Location', LocationSchema, 'Location');
