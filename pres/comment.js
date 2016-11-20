const mongoose = require('mongoose');
const Comment = mongoose.model("Comment");

module.exports = class comment {
  constructor () {}

  * newComment (next) {
    yield next;
  }

  * showComments (next) {
    yield next;
  }
};
