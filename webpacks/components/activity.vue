<template>
<div class="ui internally celled grid showactivity">
  <div class="row">
    <div class="right aligned eight wide column">
      <div class="ui small rounded image">
        <img :src="activity.refer_object.cover_picurl">
      </div>
      <h3 class="mobileshow">
        {{activity.refer_object.title}}
      </h3>
    </div>
    <div class="eight wide column">
      <div class="titletop">
        <h3 class="computershow">
          {{activity.refer_object.title}}
        </h3>
        <div>
          <i class="star icon"></i>
          <span>star:&nbsp;&nbsp;</span><div class="ui large star rating"></div>
        </div>
        <div>
          <i class="yen icon"></i>
          <span>fee:&nbsp;&nbsp;{{activity.refer_object.fee}}</span>
        </div>
        <div>
          <i class="calendar icon"></i>
          <span>start time:&nbsp;&nbsp;{{activity.refer_object.start_time}}</span>
        </div>
        <div>
          <i class="calendar icon"></i>
          <span>end time:&nbsp;&nbsp;{{activity.refer_object.end_time}}</span>
        </div>
        <div>
          <i class="linkify icon"></i>
          <span>site:&nbsp;&nbsp;<a :href="activity.refer_object.site">{{activity.refer_object.site}}</a></span>
        </div>
        <div v-if="activity.refer_object.location">
          <i class="marker icon"></i>
          <span>location:&nbsp;&nbsp;{{activity.refer_object.location.address}}</span>
        </div>
      </div>
      <div class="titlebottom">
        <div class="ui disabled labeled button" v-if="activity.favorited">
          <div class="ui red button"><i class="heart icon"></i>
            <span>Favorited</span>
          </div>
          <a class="ui basic red left pointing label">
            {{activity.favorite_count}}
          </a>
        </div>
        <div class="ui labeled button favorites" @click="favorClick(activity.id)" v-else>
          <div class="ui red button"><i class="heart icon"></i>
            <span>Favorites</span>
          </div>
          <a class="ui basic red left pointing label">
            {{activity.favorite_count}}
          </a>
        </div>
        <app-treat v-if="canTreat" class="activitytreat" :treat='treat'></app-treat>
      </div>
    </div>
  </div>
  <div class="row">
    <div class="column">
      <h4 class="ui horizontal divider">
        <i class="quote left icon"></i>
        Description
        <i class="quote right icon"></i>
      </h4>
      <div v-html="activity.refer_object.content" class="activitycontent"></div>
    </div>
  </div>
  <div class="row activityfoot">
    <div class="eleven wide column">
      <div v-if="activity.refer_object.tags && activity.refer_object.tags[0]">
        <i class="tag icon"></i>
        tags:&nbsp;&nbsp;
        <app-tags :tags="activity.refer_object.tags"></app-tags>
      </div>
    </div>
    <div class="right aligned five wide column">
      <span>
        <img class="ui avatar image" :src="activity.creater.avatar" @click="userClick(activity.creater.id)">
        presenter: {{activity.creater.nickname}}
      </span>
      &nbsp;
      <span>
        <img class="ui avatar image" :src="activity.refer_object.creater.avatar" @click="userClick(activity.refer_object.creater.id)">
        creater: {{activity.refer_object.creater.nickname}}
      </span>
    </div>
  </div>
  <div class="row">
    <div class="column">
      <h4 class="ui horizontal divider">
        <i class="comments left icon"></i>
        Comments<span v-if="activity.comment_count">({{activity.comment_count}})</span>
        <i class="comments right icon"></i>
      </h4>
    </div>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import moment from 'moment'
import xss from 'xss'
import bus from 'bus'
import Treat from './treat.vue'
import Tags from './tags.vue'

export default {
  data () {
    return {
      activity: {
        creater: {},
        refer_object: {
          creater: {}
        },
        favorited: false,
        favorite_count: 0,
      },
      canTreat: false,
      treat: {
        title: 'TreatActivity',
        type: 'activitytreat',
        data: null,
      }
    }
  },
  mounted() {
    this.showActivity();
  },
  methods: {
    showActivity() {
      let aid = this.activityid;
      if (aid) {
        let params = {};
        utils.useToken(params);
        this.$http.get("activity/"+aid,{
          params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let activity = res.body.result.activity;
            if (activity && activity.id) {

              activity.refer_object.start_time = moment(activity.refer_object.start_time).format("YYYY-MM-DD HH:mm");
              activity.refer_object.end_time = moment(activity.refer_object.end_time).format("YYYY-MM-DD HH:mm");
              this.activity = activity;
              this.treat.data = this.activity;

              this.ratingActivity()

              this.$http.get("activity/"+aid+"/content",{
                params
              }).then((res) => {
                if (utils.isResOk(res)) {
                  let content = res.body.result.content;
                  if (content) {
                    this.$set(this.activity.refer_object,'content',xss(content));
                    if (utils.ifUser(activity.creater.id)) {
                      this.canTreat = true;
                    } else {
                      this.canTreat = false;
                    }
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
      if (!utils.haveToken()) {
        alert("you should login");
        return;
      }
      if (this.activity.favorited) {
        alert("you have favorited")
        return;
      }
      if (aid) {
        //添加loading图
        $(".ui.showactivity .ui.button.favorites").toggleClass("loading");

        let params = {};
        utils.useToken(params);
        this.$http.post('activity/favorite/'+aid, null, {
          params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let activity = res.body.result.activity;
            if (activity) {
              activity.favorite_count ++;
              activity.favorited = true;

              alert('Favorited');
            }
          }
        }).catch((err) => {
          console.log(err);
        }).finally(()=>{
          //移除loading图
          $(".ui.showactivity .ui.button.favorites").toggleClass("loading");
        })
      }
    },
    ratingActivity() {
      let vm = this;
      $('.ui.showactivity .ui.rating').rating({
        initialRating: Math.floor(vm.activity.star_score),
        maxRating: 5,
        onRate(value) {
          let sid = vm.activity.id;
          let suser = vm.activity.creater.id;
          if (value && suser && sid) {
            if (utils.ifUser(suser)) {
              alert("can't star yourself!");
              return;
            }
            let params = {};
            utils.useToken(params);
            let body = {
              target_user: suser,
              target_object: sid,
              target_type: "Subject",
              star_score: value,
            }
            vm.$http.post("star", body, {params}).then((res) => {
              if (utils.isResOk(res)) {
                let star = res.body.result.star;
                if (star) {
                  alert("star ok!")
                  vm.activity.star_score = value;
                }
              } else {
                $('.ui.showactivity .ui.rating').rating({
                  initialRating: Math.floor(vm.activity.star_score),
                })
                $('.ui.showactivity .ui.rating').rating("disable")
              }
            }).catch((err) => {
              console.log(err);
            });
          }
        }
      });
    },
  },
  props: ['activityid', 'refresh'],
  watch: {
    activityid(aid) {
      this.showActivity(aid);
    },
    refresh(val, old) {
      if (val) {
        this.showActivity();
      }
    }
  },
  components: {
    "app-treat":Treat,
    "app-tags":Tags
  }
}
</script>

<style>
.ui.celled.grid.showactivity .row {
  box-shadow: none;
}
.ui.celled.grid.showactivity .row .column {
  box-shadow: none;
}
.ui.showactivity .row .titletop {
  height: 84%;
}

.ui.showactivity .row .titlebottom {
  width: 168px;
}
.ui.showactivity .row .titlebottom .button {
  vertical-align:middle;
}
.ui.showactivity .row .titlebottom .activitytreat {
  width: 100px;
}

.ui.showactivity .activitycontent {
  padding-left: 2em;
  padding-right: 2em;
}
.ui.showactivity .row.activityfoot {
  padding-left: 2em;
  padding-right: 2em;
}
.ui.showactivity .row.activityfoot .right.aligned.column .avatar.image {
  cursor: pointer;
}

/*computer*/
@media only screen and (min-width: 768px) {
  .ui.showactivity .mobileshow {
    display: none;
  }
  .ui.showactivity .computershow {
    display: flex;
  }
  .ui.showactivity .row .titletop > div {
    margin-bottom: 0.6em;
  }
}
/*mobile*/
@media only screen and (max-width: 768px){
  .ui.showactivity .computershow {
    display: none;
  }
  .ui.showactivity .mobileshow {
    display: flex;
  }
  .ui.showactivity .row .titletop > div {
    margin-bottom: 0.2em;
  }
}
</style>
