<template>
<div id="uactivitys" class="ui divided items relaxed animated list">
  <div class="ui item" v-for="activity in activitys">
   <a class="image" @click="activityClick(activity.id)">
     <img :src="activity.refer_object.cover_picurl">
   </a>
   <div class="content">
     <a class="header" @click="activityClick(activity.id)">{{activity.refer_object.title}}</a>
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
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'
import Tags from './tags.vue'

export default {
  data() {
    return {
      activitys: []
    }
  },
  mounted() {
    this.showActivitys(this.userid);
  },
  methods: {
    activityClick(aid) {
      bus.$emit('activityclick', aid);
    },
    showActivitys(uid) {
      if (uid) {
        let params = {};
        utils.useToken(params);
        this.$http.get("activitys/user/"+uid,{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let activitys = res.body.result.activitys;
            if (activitys && activitys.length) {
              activitys.forEach((e, i, a) => {
                e.refer_object.start_time = moment(e.refer_object.start_time).format("YYYY-MM-DD HH:mm");
                e.refer_object.end_time = moment(e.refer_object.end_time).format("YYYY-MM-DD HH:mm");
              })
              this.activitys = activitys;
            } else {
              this.activitys = [];
            }
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    }
  },
  props: ['userid'],
  watch: {
    userid(uid) {
      this.showActivitys(uid);
    },
  },
  components: {
    "app-tags":Tags
  }
}
</script>

<style>
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
</style>
