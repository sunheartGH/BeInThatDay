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
  <div align="center" v-if="loadmore">
    <button class="ui button large loadmore" @click="showComments">Load More</button>
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
      page: 0,
      size: 10,
      loadmore: true,
    }
  },
  mounted() {
    this.showComments();
  },
  methods: {
    showComments() {
      let uid = this.userid;
      let load = $("#ucomments .loadmore");
      if (uid) {
        let params = {
          under_type: "Subject",
          page: this.page+1,
          size: this.size,
        };
        utils.useToken(params);
        //添加loading图
        load.toggleClass("loading")
        load.attr("disabled","disabled");
        this.$http.get("comments/user/"+uid,{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let comments = res.body.result.comments;
            this.page = res.body.result.page;
            this.loadmore = res.body.result.size < this.size? false : true;

            if (comments && comments.length) {
              comments.forEach((e,i,a) => {
                a[i].created_at = moment(e.created_at).format("YYYY-MM-DD HH:mm");
              });
              if (this.page==1) {
                this.comments = comments;
              } else {
                this.comments = this.comments.concat(comments);
              }
            } else {
              if (this.page==1) {
                this.comments = [];
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
    commentClick(comment) {
      if (comment) {
        bus.$emit("commentclick", comment);
      }
    },
  },
  props: ['userid'],
  watch: {
    userid() {
      this.page = 0;
      this.showComments();
    },
  }
}
</script>

<style>
#ucomments.comments {
  max-width: 100%;
}
#ucomments .loadmore {
  width: 80%;
  margin-top: 1.4em;
}
</style>
