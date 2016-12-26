<template>
<div id="ucomments" class="ui comments massive relaxed divided aligned animated selection list">
  <div class="comment item" v-for="comment in comments" @click="commentClick(comment)">
    <a class="avatar">
      <img :src="comment.creater.avatar">
    </a>
    <div class="content">
      <a class="author">{{comment.creater.nickname}}</a>
      <div class="metadata">
        <div class="date">{{comment.created_at}}</div>
      </div>
      <div class="text">
        <a v-if="comment.reply_user"  @click.stop="userClick(comment.reply_user.id)">@{{comment.reply_user.nickname}}</a>
        {{comment.content}}
      </div>
    </div>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'
import moment from 'moment'

export default {
  data() {
    return {
      comments: [],
    }
  },
  mounted() {
    this.showComments(this.userid);
  },
  methods: {
    showComments(uid) {
      if (uid) {
        let params = {
          under_type: "Subject"
        };
        utils.useToken(params);
        this.$http.get("comments/user/"+uid,{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let comments = res.body.result.comments;
            if (comments && comments.length) {
              comments.forEach((e,i,a) => {
                a[i].created_at = moment(e.created_at).format("YYYY-MM-DD HH:mm");
              });
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
    },
    commentClick(comment) {
      if (comment) {
        bus.$emit("commentclick", comment);
      }
    },
  },
  props: ['userid'],
  watch: {
    userid(uid) {
      this.showComments(uid);
    },
  }
}
</script>

<style>
#ucomments.comments {
  max-width: 100%;
}
</style>
