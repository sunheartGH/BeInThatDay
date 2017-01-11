<template>
<div id="sactivitys">
  <div align="center" class="sactivitysinput">
    <div align="center" class="ui left icon input">
      <i class="delete link icon" v-if="keyword" @click="deleteKeyword"></i>
      <i class="search icon" v-else></i>
      <input type="text" placeholder="Search Activitys..." v-model="keyword" autofocus="autofocus" @keyup="toSearch">
    </div>
  </div>
  <div class="ui divided items relaxed list selection sactivityshow">
    <div class="ui item" v-for="activity in activitys">
     <div class="content" @click="activityClick(activity.id)">
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
     </div>
   </div>
   <div align="center" v-if="loadmore">
     <button class="ui button large loadmore" @click="moreResult">Load More</button>
   </div>
  </div>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'
export default {
  data () {
    return {
      activitys:[],
      keyword:'',
      page: 0,
      size: 10,
      loadmore: false,
    }
  },
  methods: {
    moreResult() {
      if (!this.keyword || this.keyword.length == 0) {
        this.keyword='';
        this.page= 0;
        this.loadmore= false;
        return;
      }
      let name;
      let parent;
      let load = $("#sactivitys .loadmore");
      if (this.keyword && this.keyword.length >= 2) {
        let params = {
          page: this.page+1,
          size: this.size,
          keyword: this.keyword,
          lastime: utils.dateFormat(new Date()),
        };
        utils.useToken(params);
        //添加loading图
        load.toggleClass("loading")
        load.attr("disabled","disabled");
        this.$http.get("activitys/search",{params}).then((res) => {
          if (utils.isResOk(res)) {
            let activitys = res.body.result.activitys;
            this.page = res.body.result.page;
            this.loadmore = res.body.result.size >= this.size ? true : false;

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
    },
    toSearch : utils.debounce(function() {
      if (!this.keyword || this.keyword.length == 0) {
        this.keyword='';
        this.page= 0;
        this.loadmore= false;
        return;
      }
      let name;
      let parent;
      let load = $("#sactivitys .loadmore");
      if (this.keyword && this.keyword.length >= 2) {
        let params = {
          page: 1,
          size: this.size,
          keyword: this.keyword,
          lastime: utils.dateFormat(new Date()),
        };
        utils.useToken(params);
        //添加loading图
        load.toggleClass("loading")
        load.attr("disabled","disabled");
        this.$http.get("activitys/search",{params}).then((res) => {
          if (utils.isResOk(res)) {
            let activitys = res.body.result.activitys;
            this.page = res.body.result.page;
            this.loadmore = res.body.result.size >= this.size ? true : false;

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
    }, 480),
    activityClick(activityId) {
      bus.$emit("activityclick", activityId);
    },
    deleteKeyword() {
      this.activitys=[];
      this.keyword='';
      this.page= 0;
      this.loadmore= false;
    }
  },
}
</script>

<style>
.sactivitysinput {
  position: absolute;
  top: 0px;
  z-index: 2;
  width: 100%;
}
@media only screen and (min-width: 768px) {
  .sactivitysinput {
    left: 8em;
  }
}

@media only screen and (max-width: 768px){
  .sactivitysinput {
    left: 4.8em;
  }
}
.sactivitysinput .ui.input {
  width: 100%;
  height: 2.7em;
}
.sactivitysinput .ui.input input{
  width: 100%;
  border-radius: 0px;
}
.sactivityshow.ui.items {
  padding: 0.8em;
  cursor:pointer;
}
.sactivityshow.ui.items .item  .content {
  padding-top: 0.8em;
}
.sactivityshow .loadmore {
  width: 80%;
  margin-top: 1.4em;
}
</style>




<!-- <template>
<div>
  <select v-model="selected">
    <option selected>Activity</option>
  </select>
  <input type="text" v-model="keyword" @keyup="toSearch" placeholder="search">
  <ul>
    <li v-for="item in lists" @click="itemClick(item)">
      {{item.refer_object.title}}
    </li>
  </ul>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'

export default {
  data () {
    return {
      lists:[],
      keyword:null,
      selected:null,
    }
  },
  methods: {
    toSearch: utils.debounce(function () {
      let name;
      let parent;
      if (this.keyword && this.keyword.length >= 2) {
        let params = {
          keyword: this.keyword,
          lastime: utils.dateFormat(new Date()),
        };
        utils.useToken(params);
        this.$http.get("activitys/search",{params}).then((res) => {
          if (utils.isResOk(res)) {
            let activitys = res.body.result.activitys;
            this.lists = activitys;
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    }, 480),
    itemClick(item) {
      bus.$emit("searchitemclick", {type: this.selected, item});
    },
  },
}
</script>

<style>
</style> -->
