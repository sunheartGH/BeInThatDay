<template>
<div class="ui massive relaxed divided animated selection list">
  <div class="item" v-for='user in users' @click='userClick(user.id)'>
    <div class="right floated content">
      <div class="ui button" v-if="!user.friended && addfriend">Add Friend</div>
      <div class="ui button" v-if="user.friended && removefriend">Remove Friend</div>
      <div class="ui button" v-if="!user.followed && addfollow">Add Follow</div>
      <div class="ui button" v-if="user.followed && removefollow">Remove Follow</div>
    </div>
    <img class="ui avatar image" :src="user.avatar">
    <div class="content">
      <a class="header">{{user.nickname}} <i class="icon" :class="user.gender"></i></a>
      <div class="meta">
        <span v-if="user.create_subjects">create_subjects: {{user.create_subjects}}</span>
        <span v-if="user.favor_subjects">favor_subjects: {{user.favor_subjects}}</span>
      </div>
      <div class="description">
        <p>{{user.depict}}</p>
      </div>
      <div class="extra">
        <!-- <component :is="showTags" :tags="activity.refer_object.tags"></component> -->
      </div>
    </div>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'

export default {
  data() {
    return {
      users: [],
      addfriend: false,
      removefriend: false,
      addfollow: false,
      removefollow: false,
    }
  },
  mounted() {
    this.showUsers(this.userid);
  },
  methods: {
    showUsers(uid) {
      if (uid) {
        let rtype = this.rtype;
        if (rtype == "friend") {
          this.removefriend = true;
          this.addfollow = true;
        } else if (rtype == "follow") {
          this.removefollow = true;
          this.removefriend = true;
          this.addfriend = true;
        } else if (rtype == "followed") {
          this.removefollow = true;
          this.removefriend = true;
          this.addfollow = true;
          this.addfriend = true;
        } else {
          alert("wrong relation!")
          return;
        }
        let params = {};
        utils.useToken(params);
        this.$http.get("users/"+uid+"/"+rtype,{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let users = res.body.result.users;
            if (users && users.length) {
              this.users = users;
            } else {
              this.users = [];
            }
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    },
    userClick(uid) {
      if (uid) {
        bus.$emit("userclick", uid);
      }
    },
  },
  props: ['userid','rtype'],
  watch: {
    userid(uid) {
      this.showUsers(uid);
    },
  }
}
</script>

<style>
/*.item .content .header .metadata {
  color: rgba(0, 0, 0, 0.4);
}*/
</style>
