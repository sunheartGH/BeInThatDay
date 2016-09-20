const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let FollowSchema = new Schema({
  user: {type: Schema.ObjectId, ref: 'User'},
  follow: {type: Schema.ObjectId, ref: 'User'},
  date: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Follow', FollowSchema, 'follows');
