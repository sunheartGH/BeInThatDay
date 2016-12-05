<template>
<div class="comments">
  <div v-for="comment in comments" class="commentline">
    <h5 v-if="comment">{{comment.content}}</h5>
    <h5 v-if="comment" v-on:click="userClick(comment.creater.id)">creater by: {{comment.creater.nickname}}</h5>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'

export default {
  data() {
    return {
      comments: []
    }
  },
  methods: {
    showComments(under) {
      if (under.object && under.type) {
        let params = {
          under_object: under.object,
          under_type: under.type,
          lastime: new Date(),
        };
        utils.useToken(params);
        this.$http.get("/comments",{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let comments = res.body.result.comments;
            if (comments && comments.length) {
              this.comments = comments;
            } else {
              this.comments = [];
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
    }
  },
  props: ['under'],
  watch: {
    under(obj) {
      this.showComments(obj);
    }
  }
}
</script>

<style>
</style>
