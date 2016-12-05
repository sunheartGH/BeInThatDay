const {AppInfo, Codes, Cryptos, Constants} = require("../utils");
const {User, Tag, Relation, Location} = require('../models');

exports.error = function (){
  return function* (next){
    if (this.state.error) {
      this.body = AppInfo.Msg(this.state.error.error);
      return;
    } else {
      yield next;
    }
  }
}

exports.token = function (){
  return function* (next){
    //验证参数是否存在
    let token = (this.request.body&&this.request.body.token) ||
      (this.query&&this.query.token) ||
      (this.header&&this.header["x-access-token"]);

    if (!token) {
      this.body = AppInfo.Msg("no token", Codes.Common.NO_TOKEN);
      return;
    }
    let pl = Cryptos.parseToken(token);
    if (pl) {
      let user = yield User.findById(pl.aud);
      if (user) {
        //验证用户当前正在使用的token
        if (user.token_sign == token.slice(token.lastIndexOf(".")+1, token.length)) {
          console.log("operater: ", '\x1b[32m' , user.id, '\x1b[0m');
          this.state.user = user;
          this.state.token = token;
        } else {
          this.body = AppInfo.Msg("token has past", Codes.Common.TOKEN_PAST);
          return;
        }
      } else {
        this.body = AppInfo.Msg("token can't correspond to user", Codes.Common.USER_NOTFOUND);
        return;
      }
    } else {
      this.body = AppInfo.Msg("wrong token", Codes.Common.WRONG_TOKEN);
      return;
    }
    yield next;
  }
}

exports.iftoken = function (){
  return function* (next){
    //验证参数是否存在
    let token = (this.request.body&&this.request.body.token) ||
      (this.query&&this.query.token) ||
      (this.header&&this.header["x-access-token"]);

    if (token) {
      let pl = Cryptos.parseToken(token);
      if (pl) {
        let user = yield User.findById(pl.aud);
        if (user) {
          //验证用户当前正在使用的token
          if (user.token_sign == token.slice(token.lastIndexOf(".")+1, token.length)) {
            console.log("operater: ", '\x1b[32m' , user.id);
            this.state.user = user;
          } else {
            this.body = AppInfo.Msg("token has past", Codes.Common.TOKEN_PAST);
            return;
          }
        } else {
          this.body = AppInfo.Msg("token can't correspond to user", Codes.Common.USER_NOTFOUND);
          return;
        }
      } else {
        this.body = AppInfo.Msg("wrong token", Codes.Common.WRONG_TOKEN);
        return;
      }
    }
    yield next;
  }
}

exports.captcha = function (){
  return function* (next){
    console.log("captcha validate");
    yield next;
  }
}

exports.mount = function (howto) {
  return function* (next) {
    yield next;
    if (howto && howto.chunk && howto.mounts &&
      toString.call(howto.mounts) == "[object Array]" &&
      this.body && this.body.result && this.body.result[howto.chunk]) {

      let ifCreater = false;
      let ifRelation = false;
      let ifTags = false;
      let ifLocation = false;
      if (howto.mounts.includes("creater")) {
        ifCreater = true;
      }
      if (howto.mounts.includes("relation") && this.state.user) {
        ifRelation = true;
      }
      if (howto.mounts.includes("tags")) {
        ifTags = true;
      }
      if (howto.mounts.includes("location")) {
        ifLocation = true;
      }

      let creaters = new Set();
      let relations = new Set();
      let tagss = new Set();
      let locations = new Set();

      let createrMounts = {};
      let relationMounts = {};
      let tagMounts = {};
      let locationMounts = {};

      let chunk = this.body.result[howto.chunk];
      if (toString.call(chunk) == "[object Array]") {
        for (let i = 0; i < chunk.length; i++) {
          let oneToMount = chunk[i];
          if (ifCreater) {
            if (oneToMount.creater) {
              let c = oneToMount.creater.toString();
              if ((this.state.user && c != this.state.user.id.toString())||
                !this.state.user) {

                creaters.add(c)
                if (createrMounts[c]) {
                  createrMounts[c].push(oneToMount);
                } else {
                  createrMounts[c] = [oneToMount];
                }
              }
            }
          }
          if (oneToMount.refer_object) {
            if (ifCreater) {
              if (oneToMount.refer_object.creater) {
                let c = oneToMount.refer_object.creater.toString()
                if ((this.state.user && c != this.state.user.id.toString())||
                  !this.state.user) {

                  creaters.add(c)
                  if (createrMounts[c]) {
                    createrMounts[c].push(oneToMount.refer_object);
                  } else {
                    createrMounts[c] = [oneToMount.refer_object];
                  }
                }
              }
            }
            if (ifLocation) {
              if (oneToMount.refer_object.location) {
                let l = oneToMount.refer_object.location.toString();
                locations.add(l);
                if (locationMounts[l]) {
                  locationMounts[l].push(oneToMount.refer_object);
                } else {
                  locationMounts[l] = [oneToMount.refer_object];
                }
              }
            }
          }
          if (ifRelation &&  ['user','users'].includes(howto.chunk)) {
            if (oneToMount.id) {
              let id = oneToMount.id.toString();
              if (this.state.user && id != this.state.user.id.toString()) {
                relations.add(id)
                if (relationMounts[id]) {
                  relationMounts[id].push(oneToMount);
                } else {
                  relationMounts[id] = [oneToMount];
                }
              }
            }
          }
          if (ifTags) {
            if (oneToMount.tags && oneToMount.tags.length) {
              for (let tag of oneToMount.tags) {
                let t = tag.toString();
                tagss.add(t);
                if (tagMounts[t]) {
                  tagMounts[t].push(oneToMount);
                } else {
                  tagMounts[t] = [oneToMount];
                }
              }
              oneToMount.tags = [];
            }
            if (oneToMount.refer_object && oneToMount.refer_object.tags && oneToMount.refer_object.tags.length) {
              for (let tag of oneToMount.refer_object.tags) {
                let t = tag.toString();
                tagss.add(t);
                if (tagMounts[t]) {
                  tagMounts[t].push(oneToMount.refer_object);
                } else {
                  tagMounts[t] = [oneToMount.refer_object];
                }
              }
              oneToMount.refer_object.tags = [];
            }
          }
        }
      } else {
        let oneToMount = chunk;
        if (oneToMount.creater) {
          let c = oneToMount.creater.toString();
          if ((this.state.user && c != this.state.user.id.toString()) ||
            !this.state.user) {

            creaters.add(c)
            if (createrMounts[c]) {
              createrMounts[c].push(oneToMount);
            } else {
              createrMounts[c] = [oneToMount];
            }
          }
        }
        if (ifRelation &&  ['user','users'].includes(howto.chunk)) {
          if (oneToMount.id) {
            let id = oneToMount.id.toString();
            if (this.state.user && id != this.state.user.id.toString()) {
              relations.add(id)
              if (relationMounts[id]) {
                relationMounts[id].push(oneToMount);
              } else {
                relationMounts[id] = [oneToMount];
              }
            }
          }
        }
        if (oneToMount.refer_object) {
          if (oneToMount.refer_object.creater) {
            let c = oneToMount.refer_object.creater.toString();
            if ((this.state.user && c != this.state.user.id.toString()) ||
              !this.state.user) {

              creaters.add(c)
              if (createrMounts[c]) {
                createrMounts[c].push(oneToMount.refer_object);
              } else {
                createrMounts[c] = [oneToMount.refer_object];
              }
            }
          }
          if (oneToMount.refer_object.tags && oneToMount.refer_object.tags.length) {
            for (let tag of oneToMount.refer_object.tags) {
              let t = tag.toString();
              tagss.add(t);
              if (tagMounts[t]) {
                tagMounts[t].push(oneToMount.refer_object);
              } else {
                tagMounts[t] = [oneToMount.refer_object];
              }
            }
            oneToMount.refer_object.tags = [];
          }
          if (oneToMount.refer_object.location) {
            let l = oneToMount.refer_object.location.toString();
            locations.add(l);
            locationMounts[l] = [oneToMount.refer_object];
          }
        }
      }
      creaters = Array.from(creaters);
      relations = Array.from(relations);
      tagss = Array.from(tagss);
      locations = Array.from(locations);
      if (ifCreater && creaters.length) {
        let userdocs = yield User.findByIds(creaters, null, {id:1,nickname:1,avatar:1,gender:1});
        for (let userdoc of userdocs) {
          for (let cm of createrMounts[userdoc.id.toString()]) {
            cm.creater = userdoc;
          }
        }
      }
      if (ifRelation && creaters.length) {
        let follows = yield Relation.findByRelates(this.state.user.id, creaters,
          Constants.RelateType.Follow, Constants.RelateState.Unilateral)

        if (follows) {
          for (let follow of follows) {
            for (let cm of createrMounts[follow.relate_user.toString()]) {
              cm.relation_follow = true;
            }
          }
        }

        let friends = yield Relation.findByRelates(this.state.user.id, creaters,
          Constants.RelateType.Friend, Constants.RelateState.Bilateral)

        if (friends) {
          for (let friend of friends) {
            for (let cm of createrMounts[friend.relate_user.toString()]) {
              cm.relation_friend = true;
            }
          }
        }
      }
      if (ifRelation && relations.length) {
        let follows = yield Relation.findByRelates(this.state.user.id, relations,
          Constants.RelateType.Follow, Constants.RelateState.Unilateral)

        if (follows) {
          for (let follow of follows) {
            for (let rm of relationMounts[follow.relate_user.toString()]) {
              rm.relation_follow = true;
            }
          }
        }

        let friends = yield Relation.findByRelates(this.state.user.id, relations,
          Constants.RelateType.Friend, Constants.RelateState.Bilateral)

        if (friends) {
          for (let friend of friends) {
            for (let rm of relationMounts[friend.relate_user.toString()]) {
              rm.relation_friend = true;
            }
          }
        }
      }
      if (ifTags && tagss.length) {
        let tagdocs = yield Tag.findByIds(tagss, null, {id:1,type:1,name:1});
        for (let tagdoc of tagdocs) {
          for (let tm of tagMounts[tagdoc.id.toString()]) {
            if (tm.tags && tm.tags.length) {
              tm.tags.push(tagdoc);
            } else {
              tm.tags = [tagdoc];
            }
          }
        }
      }
      if (ifLocation && locations.length) {
        let locationdocs = yield Location.findByIds(locations, null, {id:1,city:1,address:1});
        for (let locationdoc of locationdocs) {
          for (let lm of locationMounts[locationdoc.id.toString()]) {
            lm.location = locationdoc;
          }
        }
      }
    }
  }
}
