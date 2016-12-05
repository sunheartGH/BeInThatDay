<template>
<div>
  <h5>nickname: {{user.nickname}}</h5>
  <h5>gender: {{user.gender}}</h5>
  <img v-if="user.avatar" v-bind:src="user.avatar"/>
  <a>{{user.home}}</a>
  <h5>depict: {{user.depict}}</h5>
  <h5>tags: {{user.tags}}</h5>
  <h5>favor_subjects: {{user.favor_subjects}}</h5>
  <h5>create_subjects: {{user.create_subjects}}</h5>
  <h5>followed_count: {{user.followed_count}}</h5>
  <h5>follow_count: {{user.follow_count}}</h5>
  <h5>friend_count: {{user.friend_count}}</h5>
  <h5>star_score: {{user.star_score}}</h5>
  <h5>star_count: {{user.star_count}}</h5>
  <button v-on:click="followUser(user.id)">+Follow</button>
  <span v-if="user.relation_follow">followed</span>
  <button v-on:click="friendUser(user.id)">+Friend</button>
  <span v-if="user.relation_friend">friended</span>
</div>
</template>

<script>
import utils from 'utils'

export default {
  data () {
    return {
      user:{}
    }
  },
  mounted() {
    this.showUser(this.userid);
  },
  methods: {
    showUser (userId) {
      if(userId){
        let params = {};
        utils.useToken(params);
        this.$http.get("/user/"+userId,{
          params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let user = res.body.result.user;
            if (user) {
              this.user = user;
            }
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    },
    followUser(userId) {
      this.relationUser(userId, "Follow");
    },
    friendUser(userId) {
      this.relationUser(userId, "Friend");
    },
    relationUser(userId, type) {
      if (userId) {
        let params = {};
        utils.useToken(params);
        this.$http.post('/relation', {
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
    friendUser(userId) {
      console.log("friend: ", userId);
    },
  },
  props: ["userid"],
  watch: {
    userid(uid) {
      this.showUser(uid);
    }
  }
}
</script>

<style>

</style>
