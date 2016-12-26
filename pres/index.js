const {AppInfo, Codes, Cryptos, Constants} = require("../utils");
const {User, Tag, Relation, Location, Subject, Activity} = require('../models');

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
      let ifReply = false;
      let ifFavorited = false;


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
      if (howto.mounts.includes("reply")) {
        ifReply = true;
      }
      if (howto.mounts.includes("favorited")) {
        ifFavorited = true;
      }

      let creaters = new Set();
      let relations = new Set();
      let tagss = new Set();
      let locations = new Set();
      let replys = new Set();
      let favoriteds = new Set();

      let createrMounts = {};
      let relationMounts = {};
      let tagMounts = {};
      let locationMounts = {};
      let replyMounts = {};
      let favoritedMounts = {};

      function innerMount(oneToMount) {
        if (ifCreater) {
          if (oneToMount.creater) {
            let c = oneToMount.creater.toString();
            creaters.add(c)
            if (createrMounts[c]) {
              createrMounts[c].push(oneToMount);
            } else {
              createrMounts[c] = [oneToMount];
            }
          }
        }
        if (oneToMount.refer_object) {
          if (ifCreater) {
            if (oneToMount.refer_object.creater) {
              let c = oneToMount.refer_object.creater.toString()
              creaters.add(c)
              if (createrMounts[c]) {
                createrMounts[c].push(oneToMount.refer_object);
              } else {
                createrMounts[c] = [oneToMount.refer_object];
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
        if (ifRelation &&  ['users','user'].includes(howto.chunk)) {
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
        if (ifReply && ['comments','comment'].includes(howto.chunk)) {
          if (oneToMount.reply_user) {
            let r = oneToMount.reply_user.toString();
            replys.add(r);
            if (replyMounts[r]) {
              replyMounts[r].push(oneToMount);
            } else {
              replyMounts[r] = [oneToMount];
            }
          }
        }
        if (ifFavorited && ['activitys','activity'].includes(howto.chunk) && this.state.user) {
          if (oneToMount.refer_object && oneToMount.refer_object.id) {
            let a = oneToMount.refer_object.id;
            favoriteds.add(a);
            a = a.toString();
            if (favoritedMounts[a]) {
              favoritedMounts[a].push(oneToMount);
            } else {
              favoritedMounts[a] = [oneToMount];
            }
          }
        }
      }

      let chunk = this.body.result[howto.chunk];
      if (toString.call(chunk) == "[object Array]") {
        for (let i = 0; i < chunk.length; i++) {
          innerMount.call(this, chunk[i]);
        }
      } else {
        innerMount.call(this, chunk);
      }

      creaters = Array.from(creaters);
      relations = Array.from(relations);
      tagss = Array.from(tagss);
      locations = Array.from(locations);
      replys = Array.from(replys);
      favoriteds = Array.from(favoriteds);

      if (ifCreater && creaters.length) {
        let userdocs = yield User.findByIds(creaters, null, {id:1,nickname:1,avatar:1,gender:1});
        for (let userdoc of userdocs) {
          for (let cm of createrMounts[userdoc.id.toString()]) {
            cm.creater = userdoc;
          }
        }
      }
      if (ifRelation && creaters.length && this.state.user) {
        let follows = yield Relation.findByRelates(this.state.user.id, creaters,
          Constants.RelateType.Follow, Constants.RelateState.Unilateral)

        if (follows) {
          for (let follow of follows) {
            for (let cm of createrMounts[follow.relate_user.toString()]) {
              cm.followed = true;
            }
          }
        }

        let friends = yield Relation.findByRelates(this.state.user.id, creaters,
          Constants.RelateType.Friend, Constants.RelateState.Bilateral)

        if (friends) {
          for (let friend of friends) {
            for (let cm of createrMounts[friend.relate_user.toString()]) {
              cm.friended = true;
            }
          }
        }
      }
      if (ifRelation && relations.length && this.state.user) {
        let follows = yield Relation.findByRelates(this.state.user.id, relations,
          Constants.RelateType.Follow, Constants.RelateState.Unilateral)

        if (follows) {
          for (let follow of follows) {
            for (let rm of relationMounts[follow.relate_user.toString()]) {
              rm.followed = true;
            }
          }
        }

        let friends = yield Relation.findByRelates(this.state.user.id, relations,
          Constants.RelateType.Friend, Constants.RelateState.Bilateral)

        if (friends) {
          for (let friend of friends) {
            for (let rm of relationMounts[friend.relate_user.toString()]) {
              rm.friended = true;
            }
          }
        }
      }
      if (ifTags && tagss.length) {
        let tagdocs = yield Tag.findByIds(tagss, null, {id:1,name:1});
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
        let locationdocs = yield Location.findByIds(locations, null, {id:1,province:1,city:1,address:1});
        for (let locationdoc of locationdocs) {
          for (let lm of locationMounts[locationdoc.id.toString()]) {
            lm.location = locationdoc;
          }
        }
      }
      if (ifReply && replys.length) {
        let replydocs = yield User.findByIds(replys, null, {id:1,nickname:1,avatar:1,gender:1});
        for (let replydoc of replydocs) {
          for (let rm of replyMounts[replydoc.id.toString()]) {
            rm.reply_user = replydoc;
          }
        }
      }
      if (ifFavorited && favoriteds.length) {
        let favoritedocs = yield Subject.find(
          {refer_object: {$in: favoriteds}, creater: this.state.user.id, refer_type: Activity.modelName},
          {refer_object:1}
        );
        for (let favoritedoc of favoritedocs) {
          for (let fm of favoritedMounts[favoritedoc.refer_object.toString()]) {
            fm.favorited = true;
          }
        }
      }
    }
  }
}
