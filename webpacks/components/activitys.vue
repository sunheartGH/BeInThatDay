<template>
<div class="activitys">
  <div v-for="activity in activitys" class="activityline" v-on:click="activityClick(activity.id)">
    <img v-bind:src="activity.refer_object.cover_picurl" />
    <h3>{{activity.refer_object.title}}</h3>
    <summary>{{activity.refer_object.summary}}</summary>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'

export default {
  data() {
    return {
      activitys: []
    }
  },
  mounted() {
    this.showActivitys(this.showdate);
  },
  methods: {
    activityClick(aid) {
      bus.$emit('activityclick', aid);
    },
    showActivitys(date) {
      if (date) {
        let firstime = date;
        let lastime = new Date(date.getFullYear(),
                               date.getMonth(),
                               date.getDate()+1);
        let params = {
          firstime: firstime.toLocaleDateString(),
          lastime: lastime.toLocaleDateString(),
        };
        utils.useToken(params);
        this.$http.get("/activitys",{
          params: params
        }).then((res) => {
          if (utils.isResOk(res)) {
            let activitys = res.body.result.activitys;
            if (activitys && activitys.length) {
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
  props: ['showdate'],
  watch: {
    showdate(date) {
      this.showActivitys(date);
    }
  }
}
</script>

<style>
.activityline {
  height: 120px;
}
.activityline img{
  height: 120px;
  float: left;
}
</style>
