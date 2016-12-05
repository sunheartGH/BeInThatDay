<template>
<div class="calendar">
  <div justify="center" class="title">
    <button v-on:click="process(-1)">
      < 前进
    </button>
    <button>
      {{calendar.month}}
    </button>
    <button v-on:click="process(1)">
      后退 >
    </button>
  </div>
  <div class="bar">
    <div>Su</div>
    <div>Mo</div>
    <div>Tu</div>
    <div>We</div>
    <div>Th</div>
    <div>Fr</div>
    <div>Sa</div>
  </div>
  <div v-for="week in calendar.datas" class="week">
    <div v-for="day in week" class="day" v-bind:class="day.type"
    v-bind:style="day.show" v-on:click="dayClick(day.date,day.title)">

      <h3>{{day.day}}</h3>
      <h3>{{day.title}}</h3>
    </div>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'

export default {
  mounted() {
    this.process();
  },
  data() {
    return {
      calendar: {}
    }
  },
  methods: {
    dayClick (date, title) {
      if (date && title) {
        bus.$emit('dayclick', date);
      }
    },
    process(orient) {
      orient = orient || 0;
      let date = this.calendar.month ? new Date(this.calendar.month):new Date();
      date = new Date(date.getFullYear(), (date.getMonth() + orient));
      let calendar = utils.genCalendar(date);
      let params = {
        from: calendar.datas[0][0].str,
        until: calendar.datas[5][6].str,
      };
      utils.useToken(params);
      this.$http.get("/activitys/calendar",{
        params: params
      }).then((res) => {
        if (utils.isResOk(res)) {
          let activitys = res.body.result.activitys;
          for (let week of this.calendar.datas) {
            for (let day of week) {
              for (let activity of activitys) {
                let ro = activity.refer_object;
                let st = new Date(ro.start_time).toLocaleDateString();
                if (day.str == st) {
                  this.$set(day, "title", ro.title)
                  this.$set(day, "cover_picurl", ro.cover_picurl)
                  this.$set(day, "start_time", ro.start_time)
                  let bg = "background:url("+ro.cover_picurl+")";
                  this.$set(day, "show", bg + " no-repeat;");
                }
              }
            }
          }
        }
      }).catch((err) => {
        console.log(err);
      })
      this.calendar = calendar;
    }
  },
}
</script>

<style>
.title {
  text-align: center;
  height: 20px;
  background-color: #2db7f5;
}
.title button {
  background-color: #ff9900;
  border: 0px;
  border-radius: 6px;
}
.bar {
  margin: 3px;
  clear: both;
  display: flex;
  background-color: #00cc66;
}
.bar div {
  flex: 1;
  float: left;
  margin: 1px;
}
.week {
  margin: 3px;
  height: 120px;
  clear: both;
  display: flex;
}
.day {
  flex: 1;
  height: 120px;
  float: left;
  background-color: #f5f7f9;
  margin: 1px;
  border-radius: 6px;
}
.cur{
  color: #000;
}
.today{
  color: #3399ff;
}
.cur:hover {
  background-color: #2db7f5;
  cursor: pointer;
}
.pre{
  color: #aaa;
}
.nex{
  color: #aaa;
}
</style>
