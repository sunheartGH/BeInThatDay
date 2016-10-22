const serves = require("../serves");
const {comment: commentServe, sub: subServe} = serves;

const pageRgx = /^[1-9]+0*$/;
const sizeRgx = /^[1-5]0?$/;
const offsetRgx = /^[0-9]+$/;
const orderObj = {desc: -1, asc: 1};
const sortRgx = /date|favor/;

module.exports = class comment {
  constructor () {}

  //@route(post /comment)
  * newComment () {
    //某user添加某sub的评论，关联user和sub
    let user = this.session.user;
    if (user) {
      let {sub, post} = this.request.body;
      if (sub && post) {
        let comment = yield commentServe.addComment(user, sub, post);
        let result = yield subServe.updateSubComments(sub, comment["_id"]);
        if (result) {
          //console.log(result); >> { ok: 1, nModified: 1, n: 1 }
          this.body = "comment sub is ok";
        } else {
          this.body = "comment sub is wrong!";
        }
      } else {
        this.body = "sub id or post can't be none";
      }
    } else {
      this.body = "should be logon";
    }
  }

  //@route(get /comment/sub/:id)
  * querySubComments () {
    //查询某sub的评论
    let subid = this.params.id;
    if (subid) {
      let {page, size, offset, sort, order} = this.query;
      this.query.page = pageRgx.test(page) ? Number(page) : 1;
      this.query.size = sizeRgx.test(size) ? Number(size) : 10;
      this.query.offset = offsetRgx.test(offset) ? Number(offset) : 0;
      sort = sortRgx.test(sort) ? sort : 'favor';
      order = order in orderObj ? order : 'asc';
      this.query.order = orderObj[order];
      let sortObj = {};
      sortObj[sort] = order;
      this.query.sort = sortObj;

      let result = yield commentServe.findComments(subid, this.query);
      if (result) {
        this.body = result;
      } else {
        this.body = "query comment for sub is wrong !"
      }
    } else {
      this.body = "sub id can't be none";
    }
  }

  //@route(put /comment/:id/like)
  * updateCommentLike () {
    //某评论被赞
    let commentid = this.params.id;
    if (commentid) {
      let result = yield commentServe.updateCommentLike(commentid);
      if (result) {
        this.body = result;
      } else {
        this.body = "comment like has wrong";
      }
    } else {
      this.body = "comment id is wrong";
    }

  }
};
