const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FollowSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  follow: {type: Schema.ObjectId, ref: 'User'},
  date: {type: Date, default: Date.now}
});

let Follow = mongoose.model('Follow', FollowSchema, 'follows');

FollowSchema.statics.saveFollow = function* (user, followid) {
  //用户关注用户，创建条目
  let follow = new Follow({user: user, follow: mongoose.Types.ObjectId(followid)});
  return yield follow.save();
}
