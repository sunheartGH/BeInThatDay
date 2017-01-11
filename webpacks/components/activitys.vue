<template>
<div id="activitys" class="ui divided items relaxed selection list">
  <div class="ui item" v-for="activity in activitys" @click="activityClick(activity.id)">
   <a class="image" >
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
 <div class="ui large centered inline text loader">Adding more content... </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'
import moment from 'moment'
import Tags from './tags.vue'

export default {
  data() {
    return {
      activitys: [],
      page: 0,
      size: 10,
      stopload: false,
    }
  },
  mounted() {
    this.showActivitys(this.ondate);
    let vm = this;
    $('#activitys').visibility({
      once: false,
      observeChanges: false,
      onBottomVisible() {
        if (!vm.stopload) {
          vm.showActivitys(vm.ondate);
        }
      }
    })
  },
  methods: {
    activityClick(aid) {
      bus.$emit('activityclick', aid);
    },
    showActivitys(date) {
      date = date || this.ondate;
      let loader = $("#activitys .loader");
      if (date) {
        let firstime = date;
        let lastime = moment(date).add(1, 'd').toDate(); //new Date(date.getFullYear(),date.getMonth(),date.getDate()+1);
        let params = {
          firstime: utils.dateFormat(firstime),
          lastime: utils.dateFormat(lastime),
          page: this.page+1,
          size: this.size,
        };
        utils.useToken(params);

        if (this.oncity) {
          params.city = this.oncity;
        }

        if (this.userid) {
          params.userid = this.userid;
        }

        //添加loading图
        loader.toggleClass('active');
        $("body").animate({scrollTop: $('#activitys').offset().top}, 1000);

        this.$http.get("activitys",{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let activitys = res.body.result.activitys;
            if (activitys && activitys.length) {
              activitys.forEach((e, i, a) => {
                e.refer_object.start_time = moment(e.refer_object.start_time).format("YYYY-MM-DD HH:mm");
                e.refer_object.end_time = moment(e.refer_object.end_time).format("YYYY-MM-DD HH:mm");
              })
              this.page = res.body.result.page
              if (this.page <= 1) {
                this.activitys = activitys;
              } else {
                this.activitys = this.activitys.concat(activitys);
              }
              this.stopload = res.body.result.size < this.size ? true : false;

            } else {
              this.activitys = [];
            }
          }
        }).catch((err) => {
          console.log(err);
        }).finally(()=>{
          //移除loading图
          loader.toggleClass('active');
        })
      } else {
        this.activitys = [];
      }
    }
  },
  props: ['ondate', "oncity", "refresh", "userid"],
  watch: {
    ondate(date) {
      this.page = 0;
      this.showActivitys(date);
    },
    oncity() {
      this.page = 0;
      this.showActivitys();
    },
    userid() {
      this.process();
    },
    refresh(val, old) {
      this.page = 0;
      if (val) {
        this.showActivitys();
      }
    }
  },
  components: {
    "app-tags":Tags
  }
}
</script>

<style>
#activitys.ui.items {
  padding: 0.4em;
}
#activitys.ui.items .item .image img {
  height: 108px;
  padding-top: 0.5em;
}
#activitys.ui.items .item .content {
  padding-top: 0.8em;
}
</style>
