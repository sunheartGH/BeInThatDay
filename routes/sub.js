let subServe = require('../serves').sub,
    actServe = require('../serves').act,
    userServe = require('../serves').user;

const pageRgx = /^[1-9]+0*$/;
const sizeRgx = /^[1-5]0?$/;
const offsetRgx = /^[0-9]+$/;
const orderObj = {desc: -1, asc: 1};
const sortRgx = /date|favor/;

module.exports = class sub {
  constructor () {}

  /*
  @route(post /sub)
  */
  * createSub () {
    //添加sub，记录用户，token验证，添加act和sub，并作关联
    if (this.session.user) {
      let {title, post, actday} = this.request.body;
      if (title && post && actday) {
        //生成act
        let result = yield actServe.addAct(this.session.user, this.request.body);
        if (result) {
          //生成sub
          let actid = result['_id'];
          result = yield subServe.addSub(this.session.user, actid);
          if (result) {
            //更新sub的origin
            let subid = result['_id']
            result = yield actServe.setActSub(actid, subid);
            if (result) {
              result = yield subServe.setSubSource(subid, subid);
              if (result) {
                //console.log(result); >> { ok: 1, nModified: 1, n: 1 }
                this.body = "save sub and set sub source is ok";
              } else {
                this.body = "set sub source is wrong!";
              }
            } else {
              this.body = "set act sub is wrong!";
            }
          } else {
            this.body = "sub save wrong!";
          }
        } else {
          this.body = "act save wrong!";
        }
      } else {
        this.body = "title/post/actday can't be none";
      }
    } else {
      this.body = "should be logon";
    }
  }
  //@route(get /sub/:id)
  * querySub () {
    //查看具体的日历项，包括内容，评论，权限过滤，是否公开，好友，public等判断
    //如果act是sub原创，favor显示act的favor
    let subid = this.params.id;
    if (subid) {
      let result = yield subServe.findSub(subid);
      if (result) {
        this.body = result;
      } else {
        this.body = "query sub is wrong !"
      }
    } else {
      this.body = "sub id can't be none";
    }
  }

  * updateSub () {
    //@route(put /sub/:id)
    //更新sub信息，token和用户权限判断，更新关联的act信息
  }

  //@route(put /sub/:id/favor)
  * userFavorSub () {
    //创建对应用户的sub,并关联act
    //收藏某sub，更新其favor，并更新关联的act的favor
    //先检查是否已经和act关联过
    let user = this.session.user;
    if (user) {
      let subid = this.params.id;
      if (subid) {
        let result = yield subServe.findUserSub(user, subid);
        if (!result) {
          //查询被收藏sub的信息
          let subdoc = yield subServe.findSubJust(subid);
          //更新被收藏sub的收藏数，(先不更新原始sub的收藏数)
          yield subServe.updateSubFavor(subid);

          //更新被收藏sub关联的act收藏数
          yield actServe.updateActFavor(subdoc.act);

          //更新用户收藏sub的favor数
          yield userServe.updateUserFavors(user);

          //创建新sub
          let newSub = yield subServe.addSub(user, subdoc.act);
          if (newSub) {
            //更新新建的sub的source为被收藏的sub的id
            result = yield subServe.setSubSource(newSub['_id'], subdoc['_id']);
            if (result) {
              //console.log(result); >> { ok: 1, nModified: 1, n: 1 }
              this.body = "save sub and set sub source is ok";
            } else {
              this.body = "set sub source is wrong!";
            }
          } else {
            this.body = "sub save wrong!";
          }
        } else {
          this.body = "user have favor this sub!";
        }
      } else {
        this.body = "sub id is wrong!";
      }
    } else {
      this.body = "must be logon!";
    }
  }

  //@route(put /sub/:id/tag/:tag)
  * updateSubTag () {
    //更新sub关联的act的tag
    //暂时不做用户权限控制
    let {id, tag} = this.params;
    if (id && tag) {
      //查询对应的sub信息
      this.state.subid = id;
      let subdoc = yield subServe.findSubJust(id);
      //查询此tag是否已添加过
      let actid = subdoc.act;
      let actTag = yield actServe.findActTag(actid, tag);
      if (!actTag) {
        let result = yield actServe.addActTag(actid, tag);
        if (result) {
          this.body = "add sub tag is ok";
        } else {
          this.body = "add sub tag has wrong";
        }
      } else {
        this.body = "sub tag has added";
      }
    } else {
      this.body = "sub id or add tag is wrong!";
    }
  }

  //@route(put /sub/:id/tag/:tag/like)
  * updateSubTagFavor () {
    //更新sub关联的act的tag的like, 标签被赞
    //暂时不做用户权限控制
    let {id, tag} = this.params;
    if (id && tag) {
      //查询对应的sub信息
      let subdoc = yield subServe.findSubJust(id);
      let actid = subdoc.act;
      //查询此tag是否已添加过
      let acttag = yield actServe.findActTag(actid, tag);
      if (acttag) {
        let result = yield actServe.updateActTagFavor(actid, acttag);
        if (result) {
          this.body = "increase sub tag like is ok";
        } else {
          this.body = "increase tag like has wrong";
        }
      } else {
        this.body = "sub tag not find";
      }
    } else {
      this.body = "sub id or tag is wrong!";
    }
  }

  //@route(get /:username)
  * queryUserSubs () {
    //查看某用户的日历，即查询某用户某月的每天最热/最新的sub
    let username = this.params.username;
    if (username) { //判断username格式
      let {de, to} = this.query;
      if (de && to) {
        let user = yield userServe.findByUsername(username);
        if (user) {
          let result = yield subServe.findUserMonHot(user['_id'], de, to);
          if (result) {
            this.body = result;
          } else {
            this.body = "query user subs occurs wrong";
          }
        } else {
          this.body = "username to id is wrong";
        }
      } else {
        this.body = "de and to is none";
      }
    } else {
      this.body = "username wrong format";
    }
  }

  //@route(get /:username/:day)
  * queryUserDaySubs () {
    //查看某用户某天的日历，page查询，最热排序/最新排序
    let {username, day} = this.params;
    if (username && day) { //判断username和day的格式
      let user = yield userServe.findByUsername(username);
      if (user) {
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

        let result = yield subServe.findUserDayPage(day, user['_id'], this.query);
        if (result) {
          this.body = result;
        } else {
          this.body = "query user day subs occurs wrong";
        }
      } else {
        this.body = "username to id is wrong";
      }
    } else {
      this.body = "username or day wrong format";
    }
  }
};
