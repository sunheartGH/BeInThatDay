<template>
<div>
  <button v-on:click="favorClick(activity.id)">Favorites</button>
  <img v-bind:src="activity.refer_object.cover_picurl" />
  <h5 v-on:click="userClick(activity.creater.id)">created by: {{activity.creater.nickname}}</h5>
  <h5 v-on:click="userClick(activity.refer_object.creater.id)">present by: {{activity.refer_object.creater.nickname}}</h5>
  <h3>{{activity.refer_object.title}}</h3>
  <p>{{activity.refer_object.content}}</p>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'

export default {
  data () {
    return {
      activity: {
        creater: {},
        refer_object: {
          creater: {}
        }
      }
    }
  },
  mounted() {
    this.showActivity(this.activityid)
  },
  methods: {
    showActivity(aid) {
      if (aid) {
        let params = {};
        utils.useToken(params);
        this.$http.get("/activity/"+aid,{
          params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let activity = res.body.result.activity;
            if (activity && activity.id) {
              this.activity = activity;

              this.$http.get("/activity/"+aid+"/content",{
                params
              }).then((res) => {
                if (utils.isResOk(res)) {
                  let content = res.body.result.content;
                  if (content) {
                    this.$set(this.activity.refer_object,'content',content);
                  }
                }
              }).catch((err) => {
                console.log(err);
              });
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
    favorClick(aid) {
      if (aid) {
        let params = {};
        utils.useToken(params);
        this.$http.post('/activity/favorite/'+aid, null, {
          params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let activity = res.body.result.activity;
            if (activity) {
              alert('Favorited');
            }
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    }
  },
  props: ['activityid'],
  watch: {
    activityid(aid) {
      this.showActivity(aid);
    }
  }
}
</script>

<style>
</style>
