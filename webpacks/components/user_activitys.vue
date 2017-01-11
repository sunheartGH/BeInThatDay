<template>
<div id="uactivitys" class="ui divided items relaxed selection list">
  <button class="ui primary basic icon button calendarbut" @click="userCalendarClick">
    <i class="large block layout icon"></i>
  </button>
  <div class="ui item" v-for="activity in activitys" @click="activityClick(activity.id)">
   <a class="image">
     <img :src="activity.refer_object.cover_picurl">
   </a>
   <div class="content">
     <a class="header">{{activity.refer_object.title}}</a>
     <div class="meta">
       <span><i class="red heart icon"></i>{{activity.favorite_count}}</span>
       <span><i class="comments icon"></i>{{activity.comment_count}}</span>
       <span>start_time: {{activity.refer_object.start_time}}</span>
       <span>end_time: {{activity.refer_object.end_time}}</span>
     </div>
     <div class="description">
       <p>{{activity.refer_object.summary}}</p>
     </div>
     <div class="extra">
       <app-tags :tags="activity.refer_object.tags" :class="'mini'"></app-tags>
     </div>
   </div>
 </div>
 <div align="center" v-if="loadmore">
   <button class="ui button large loadmore" @click="showActivitys">Load More</button>
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
      activitys: [],
      page: 0,
      size: 10,
      loadmore: true,
    }
  },
  mounted() {
    this.showActivitys();
  },
  methods: {
    activityClick(aid) {
      bus.$emit('activityclick', aid);
    },
    userCalendarClick() {
      bus.$emit('usercalendar', this.userid);
    },
    showActivitys() {
      let uid = this.userid;
      let load = $("#uactivitys .loadmore");
      if (uid) {
        let params = {
          page: this.page+1,
          size: this.size,
        };
        utils.useToken(params);

        //添加loading图
        load.toggleClass("loading")
        load.attr("disabled","disabled");
        this.$http.get("activitys/user/"+uid,{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let activitys = res.body.result.activitys;
            this.page = res.body.result.page;
            this.loadmore = res.body.result.size < this.size? false : true;
            if (activitys && activitys.length) {
              activitys.forEach((e, i, a) => {
                e.refer_object.start_time = moment(e.refer_object.start_time).format("YYYY-MM-DD HH:mm");
                e.refer_object.end_time = moment(e.refer_object.end_time).format("YYYY-MM-DD HH:mm");
              })
              if (this.page==1) {
                this.activitys = activitys;
              } else {
                this.activitys = this.activitys.concat(activitys);
              }
            } else {
              if (this.page==1) {
                this.activitys = [];
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
    }
  },
  props: ['userid'],
  watch: {
    userid() {
      this.page = 0;
      this.showActivitys();
    },
  },
  components: {
    "app-tags":Tags
  }
}
</script>

<style>
#uactivitys .calendarbut {
  float: right;
  padding: 0.28em;
  margin-bottom: 0.4em;
}
#uactivitys.ui.items {
  padding: 0.4em;
}
#uactivitys.ui.items .item  .image img {
  height: 108px;
  padding-top: 0.5em;

}
#uactivitys.ui.items .item  .content {
  padding-top: 1.4em;
}
#uactivitys .loadmore {
  width: 80%;
  margin-top: 1.4em;
}
</style>
