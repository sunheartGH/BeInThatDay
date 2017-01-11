<template>
<div id="urelations" class="ui massive relaxed divided animated selection list">
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
        <app-tags :tags="user.tags" :class="'mini'"></app-tags>
      </div>
    </div>
  </div>
  <div align="center" v-if="loadmore">
    <button class="ui button large loadmore" @click="showUsers">Load More</button>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'
import Tags from './tags.vue'

export default {
  data() {
    return {
      users: [],
      addfriend: false,
      removefriend: false,
      addfollow: false,
      removefollow: false,
      page: 0,
      size: 10,
      loadmore: true,
    }
  },
  mounted() {
    this.showUsers();
  },
  methods: {
    showUsers() {
      let uid = this.userid;
      let load = $("#urelations .loadmore");
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
        let params = {
          page: this.page+1,
          size: this.size,
        };
        utils.useToken(params);
        //添加loading图
        load.toggleClass("loading")
        load.attr("disabled","disabled");
        this.$http.get("users/"+uid+"/"+rtype,{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let users = res.body.result.users;
            this.page = res.body.result.page;
            this.loadmore = res.body.result.size < this.size? false : true;

            if (users && users.length) {
              if (this.page==1) {
                this.users = users;
              } else {
                this.users = this.users.concat(users);
              }
            } else {
              if (this.page==1) {
                this.users = [];
              }
            }
          }
        }).catch((err) => {
          console.log(err);
        }).finally(()=>{
          //移除loading图
          load.toggleClass("loading")
          load.removeAttr("disabled")
        })
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
    userid() {
      this.page = 0;
      this.loadmore = true;
      this.showUsers();
    },
    rtype() {
      this.page = 0;
      this.loadmore = true;
    }
  },
  components: {
    "app-tags":Tags
  }
}
</script>

<style>
/*.item .content .header .metadata {
  color: rgba(0, 0, 0, 0.4);
}*/
#urelations .loadmore {
  width: 80%;
  margin-top: 1.4em;
}
</style>
