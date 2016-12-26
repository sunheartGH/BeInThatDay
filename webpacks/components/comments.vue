<template>
<div>
  <h4 class="ui horizontal divider">
    <i class="comments left icon"></i>
    Comments
    <i class="comments right icon"></i>
  </h4>
  <div class="ui comments">
    <div class="comment" v-for="comment in comments">
      <a class="avatar">
        <img :src="comment.creater.avatar">
      </a>
      <div class="content">
        <a class="author" @click="userClick(comment.creater.id)">{{comment.creater.nickname}}</a>
        <div class="metadata">
          <div class="date">{{comment.created_at}}</div>
        </div>
        <div class="text">
          <a v-if="comment.reply_user">@{{comment.reply_user.nickname}}</a>
          {{comment.content}}
        </div>
        <div class="actions">
          <a class="reply" @click="replyClick(comment.id, comment.creater)">Reply</a>
        </div>
      </div>
    </div>
    <form class="ui reply form">
      <div class="field">
        <textarea v-model="commentContent" class="ui segment"></textarea>
        <div class="ui top right attached image label" v-if="reply.id" style="margin:0.2em">
          <img :src="reply.avatar">{{reply.nickname}}<i class="delete icon" @click="cancelReply">
          </div>
      </div>
      <div class="ui primary submit labeled icon button" @click="treatComment"><i class="icon edit"></i> Add Comment </div>
    </form>
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
      commentContent: null,
      reply:{
        id: null,
        user: null,
        avatar: null,
        nickname: null,
      },
    }
  },
  methods: {
    showComments(under) {
      under = under || this.under;
      if (under.object && under.type) {
        let params = {
          under_object: under.object,
          under_type: under.type,
          lastime: utils.dateFormat(new Date()),
        };
        utils.useToken(params);
        this.$http.get("comments",{
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
    replyClick(id, user) {
      if (utils.haveToken()) {
        if (utils.ifUser(user.id)) {
          alert("can't reply yourself");
          return;
        }
        this.reply.id = id;
        this.reply.user = user.id;
        this.reply.avatar = user.avatar;
        this.reply.nickname = user.nickname;
      } else {
        alert("you should login");
      }
    },
    cancelReply() {
      this.reply.id = null;
      this.reply.user = null;
      this.reply.avatar = null;
      this.reply.nickname = null;
    },
    commentClear() {
      this.commentContent = null;
      this.cancelReply();
    },
    treatComment() {
      if (utils.haveToken()) {
        if (this.under.object && this.under.type && this.commentContent) {
          this.butable = true;
          let params = {};
          let body = {
            under_object: this.under.object,
            under_type: this.under.type,
            content: this.commentContent
          };
          if (this.reply.id) {
            body.reply_user = this.reply.user;
            body.reply_comment = this.reply.id;
          }
          utils.useToken(params);
          this.$http.post("comment", body, {params}).then((res) => {
            if (utils.isResOk(res)) {
              let comment = res.body.result.comment;
              if (comment) {
                alert('treat comment success');
                comment.created_at = moment(comment.created_at).format("YYYY-MM-DD HH:mm");
                this.comments.push(comment);
              } else {
                alert('no comment field changed');
              }
            }
            this.butable = false;
          }).catch((err) => {
            console.log(err);
            this.butable = false;
          });
          this.commentClear();
        }
      } else {
        alert("you should login");
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
div.comments {
  padding-left: 2em;
  padding-right: 2em;
}
</style>
