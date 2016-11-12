let mongoose = require('mongoose');
const Schema = mongoose.Schema;

let LocationSchema = new Schema({
  creater: {type: Schema.ObjectId, ref: 'User'},              //创建者id
  created_at: {type: Date, default: Date.now},                //创建日期
  updated_at: {type: Date, default: Date.now},                //更新日期
  longitude: Number,                                          //经度
  latitude: Number,                                           //纬度
  country: String,                                            //国家
  city: String,                                               //城市
  address: String,                                            //详细地址
});


LocationSchema.statics.saveLocation = function* () {
  let entity = new Location({});
  return yield entity.save();
}


module.exports = mongoose.model('Location', LocationSchema, 'Location');
