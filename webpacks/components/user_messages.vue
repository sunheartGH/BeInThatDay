<template>
<div id="umessages" class="ui massive relaxed divided animated selection list">
  <div class="item" v-for='message in messages' @click='userClick(user.id)'>
    <div class="content">
      <a class="header">{{message.title}}</a>
      <div class="description">
        <p v-html="message.content"></p>
      </div>
    </div>
  </div>
  <div align="center" v-if="loadmore">
    <button class="ui button large loadmore" @click="showMessages">Load More</button>
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
      messages: [],
      page: 0,
      size: 10,
      loadmore: true,
    }
  },
  mounted() {
    this.showMessages(this.userid);
  },
  methods: {
    showMessages() {
      let uid = this.userid;
      let load = $("#umessages .loadmore");
      if (uid) {
        let params = {
          page: this.page+1,
          size: this.size,
        };
        utils.useToken(params);
        //添加loading图
        load.toggleClass("loading")
        load.attr("disabled","disabled");
        this.$http.get("messages/user/"+uid,{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let messages = res.body.result.messages;
            this.page = res.body.result.page;
            this.loadmore = res.body.result.size < this.size? false : true;

            if (messages && messages.length) {
              messages.forEach((e,i,a) => {
                a[i].created_at = moment(e.created_at).format("YYYY-MM-DD HH:mm");
                if (a[i].stuff && a[i].stuff.length) {
                  a[i].stuff.forEach((one) => {
                    a[i].content = a[i].content.replace("#"+one.key+"#", "<a>"+one.text+"</a>")
                  })
                }
              });
              if (this.page==1) {
                this.messages = messages;
              } else {
                this.messages = this.messages.concat(messages);
              }
            } else {
              if (this.page==1) {
                this.messages = [];
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
  },
  props: ['userid'],
  watch: {
    userid() {
      this.showMessages();
    },
  },
  components: {
    "app-tags":Tags
  }
}
</script>

<style>
#umessages .loadmore {
  width: 80%;
  margin-top: 1.4em;
}
</style>
