<template>
<div class="ui stackable four column grid user">
  <div class="ui right aligned column">
    <img class="ui tiny circular image" :src="user.avatar">
    <div class="operates">
      <app-treat class="usertreat mini" v-if="canTreat" :treat='treat'></app-treat>
      <div class="ui disabled mini red button" v-if="user.followed || this.canTreat">
        <i class="heart icon"></i>{{user.followed_count||0}}
      </div>
      <div class="ui mini red vertical animated button" @click="relationUser(this.follow)" v-else>
        <div class="hidden content"><i class="heart icon"></i>+Follow</div>
        <div class="visible content">
          <i class="heart icon"></i>{{user.followed_count||0}}
        </div>
      </div>
      <div class="ui disabled mini blue button" v-if="user.friended || this.canTreat">
        <i class="add user icon"></i>{{user.friend_count||0}}
      </div>
      <div class="ui mini blue vertical animated button" @click="relationUser(this.friend)" v-else>
        <div class="hidden content"><i class="add user icon"></i>+Friend</div>
        <div class="visible content">
          <i class="add user icon"></i>{{user.friend_count||0}}
        </div>
      </div>
    </div>
  </div>
  <div class="ui column info">
    <div class="header">nickname: {{user.nickname}}</div>
    <div class="header" v-if="user.username">username: {{user.username}}</div>
    <div>gender: {{user.gender}}</div>
    <div>home: <a :href="user.home">{{user.home}}</a></div>
  </div>
  <div class="ui column info">
    <div>favor_subjects: {{user.favor_subjects}}</div>
    <div>create_subjects: {{user.create_subjects}}</div>
    <div>follow_count: {{user.follow_count}}</div>
    <div>followed_count: {{user.followed_count}}</div>
    <div>star_score: {{user.star_score}}</div>
    <div>star_count: {{user.star_count}}</div>
  </div>
  <div class="ui column">
    <div>depict: {{user.depict}}</div>
    <app-tags :tags="user.tags"></app-tags>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'
import Treat from './treat.vue'
import Tags from './tags.vue'

export default {
  data () {
    return {
      user:{},
      follow: "Follow",
      friend: "Friend",
      canTreat: false,
      treat: {
        title: 'TreatUser',
        type: 'usertreat',
        data: null,
      },
    }
  },
  mounted() {
    this.showUser(this.userid);
  },
  methods: {
    showUser (userId) {
      userId = userId || this.userid;
      if (utils.ifUser(userId)) {
        this.canTreat = true;
      } else {
        this.canTreat = false;
      }
      if(userId){
        let params = {};
        utils.useToken(params);
        this.$http.get("user/"+userId,{params}).then((res) => {
          if (utils.isResOk(res)) {
            let user = res.body.result.user;
            if (user) {
              this.user = user;
              this.treat.data = this.user;
            }
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    },
    relationUser(type) {
      if (this.user.id && type) {
        if (utils.ifUser(this.user.id)) {
          alert("can't "+type+" yourself")
          return;
        }
        if (this.user.friended && type == "Friend") {
          alert("you have added this friend");
          return;
        }
        if (this.user.followed && type == "Follow") {
          alert("you have followed this user");
          return;
        }
        let params = {};
        utils.useToken(params);
        this.$http.post('relation', {
          relate_user: userId,
          relate_type: type
        }, {params}).then((res) => {
          if (utils.isResOk(res)) {
            let relation = res.body.result.relation;
            if (relation) {
              alert("+" + type + ' Ok');
            }
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    },
  },
  props: ["userid", "refresh"],
  watch: {
    userid(uid) {
      this.showUser(uid);
    },
    refresh(val, old) {
      if (val) {
        this.showUser();
      }
    }
  },
  components: {
    "app-treat":Treat,
    "app-tags":Tags
  }
}
</script>

<style>
.ui.user {
  color: #efefef;
  background-color: #252b33;
}
.ui.user .ui.column:first-child{
  text-align: right;
}
.ui.user .ui.column .circular.image {
  display: inline;
}
.ui.user .ui.column.info{
  display: flex;
  flex-direction: column;
  justify-content:center;
}
.ui.user .ui.column.info div{
  flex: 1;
}
.ui.user .ui.column img.ui.circular.image{
  margin-bottom: 3em;
}
.ui.user .ui.column .operates {
  position: absolute;
  bottom: 1rem;
  right:1rem;
}
.ui.user .ui.column .operates .usertreat{
  width: 8em;
}
</style>
