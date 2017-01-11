<template>
<div class="ui comments">
  <div class="comment"
    v-for="comment in comments"
    @click="commentClick"
    :commentid="comment.id"
    :commentuser="comment.creater.id"
    :starscore="comment.star_score"
  >
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
  <div class="ui pagination menu" v-if="pages.length">
    <a class="item" v-if="page>1" @click="pageChange(1)">
      <i class="angle double left icon"></i>
    </a>
    <a class="item" v-if="page>1" @click="pageChange(page-1)">
      <i class="angle left icon"></i>
    </a>
    <a class="item" v-for="p in pages" @click="pageChange(p)" :class="p == page?'active':''">
      {{p}}
    </a>
    <a class="item" v-if="page<total" @click="pageChange(page+1)">
      <i class="angle right icon"></i>
    </a>
    <a class="item" v-if="page<total" @click="pageChange(total)">
      <i class="angle double right icon"></i>
    </a>
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
  <div class="ui special popup">
    <div class="ui star rating"></div>
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
      page: 1,
      size: 10,
      pages:[],
      total: 0,
      pagelen: 5,
    }
  },
  mounted() {
  },
  methods: {
    pageChange(page) {
      if (page >0 && page <= this.total && this.page != page) {
        this.page = page;
        this.showComments();
      }
    },
    showComments(under) {
      under = under || this.under;
      if (under.object && under.type) {
        let params = {
          under_object: under.object,
          under_type: under.type,
          lastime: utils.dateFormat(new Date()),
          page: this.page,
          size: this.size,
        };
        utils.useToken(params);
        this.$http.get("comments",{params}).then((res) => {
          if (utils.isResOk(res)) {
            let comments = res.body.result.comments;
            if (comments && comments.length) {
              comments.forEach((e,i,a) => {
                a[i].created_at = moment(e.created_at).format("YYYY-MM-DD HH:mm");
              });
              this.comments = comments;

              //生成pages数据
              let count = res.body.result.count;
              this.page = res.body.result.page;
              this.total = Math.floor(count/this.size);
              if (count%this.size > 0) {
                this.total++;
              }
              let startPage = this.page - Math.floor(this.pagelen/2);
              let endPage = this.page + Math.floor(this.pagelen/2);
              if (startPage < 1) startPage = 1;
              if (endPage > this.total) endPage = this.total;
              this.pages = [];
              for (let i = startPage; i <= this.total; i++) {
                this.pages.push(i);
              }
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
    },
    commentClick(e) {
      let vm = this;
      let comment = $(e.currentTarget);
      let cscore = comment.attr("starscore");
      let cid = comment.attr("commentid");
      let cuser = comment.attr("commentuser");
      let popup = $('.ui.comments .ui.special.popup');
      if (popup.attr("onshow") == cid && popup.attr("class").includes("visible")) {
        comment.popup("hide")
      } else {
        popup.attr("onshow", cid)
        comment.popup({
          on: "manual",
          hoverable: true,
          movePopup: false,
          popup: '.ui.comments .ui.special.popup',
        })
        comment.popup("show")
        $('.ui.comments .ui.rating').rating({
          initialRating: Math.floor(cscore),
          maxRating: 5,
          onRate(value) {
            if (value && cuser && cid) {
              if (utils.ifUser(cuser)) {
                alert("can't star yourself!");
                return;
              }
              let params = {};
              utils.useToken(params);
              let body = {
                target_user: cuser,
                target_object: cid,
                target_type: "Comment",
                star_score: value,
              }
              vm.$http.post("star", body, {params}).then((res) => {
                if (utils.isResOk(res)) {
                  let star = res.body.result.star;
                  if (star) {
                    alert("star ok!")
                    comment.attr("starscore", value);
                  }
                }
              }).catch((err) => {
                console.log(err);
              });
            }
          }
        });
      }
    },
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
.ui.comments {
  padding-left: 2em;
  padding-right: 2em;
  /*min-width: 100%;*/
}
.ui.comments .pagination.menu{
  margin-top: 2em;
  margin-left: 2em;
  box-shadow: none;
}
</style>
