<template>
<div class="calendar">
  <div class="title">
    <div class="ui buttons">
      <button class="ui labeled icon button" @click="process(-1)"><i class="left chevron icon"></i>上个月</button>
      <button class="ui button" @click="curMonth"> {{calendar.month}} </button>
      <button class="ui right labeled icon button" @click="process(1)">下个月<i class="right chevron icon"></i> </button>
    </div>
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
    <div v-for="day in week" class="day" :class="day.type" @click="dayClick(day.date, day.title)">
      <img v-if="day.show" :src="day.show">
      <div class="daynum">
        {{day.day}}
      </div>
      <div class="daytitle">
        {{day.title}}
      </div>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'

export default {
  data() {
    return {
      calendar: {}
    }
  },
  mounted() {
    this.process();
  },
  methods: {
    dayClick (date, title) {
      if (date && title) {
        bus.$emit('dayclick', date);
      }
    },
    curMonth() {
      this.calendar.month = utils.curMonth();
      this.process();
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

      if (this.oncity) {
        params.city = this.oncity;
      }

      if (this.userid) {
        params.userid = this.userid;
      }

      this.$http.get("activitys/calendar",{
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
                  this.$set(day, "show", ro.cover_picurl);
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
  props: ["oncity","refresh","userid"],
  watch: {
    oncity() {
      this.process();
    },
    userid() {
      this.process();
    },
    refresh(val, old) {
      if (val) {
        this.process();
      }
    }
  }
}
</script>

<style>
.title {
  text-align: center;
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
  background-color: #fff;
}
.bar div {
  flex: 1;
  float: left;
  margin: 1px;
}
.week {
  margin: 3px;
  clear: both;
  display: flex;
}
.day {
  flex: 1;
  float: left;
  background-color: #fff;
  margin: 1px;
  position: relative;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
}
.daytitle {
  bottom: 0px;
  position: absolute;
  color: white;
}

/*computer*/
@media only screen and (min-width: 768px) {
  .day {
    height: 120px;
  }
  .week {
    height: 120px;
  }
  .daytitle {
    height: auto;
    font-size: inherit;
    overflow:inherit;
    line-height: 18px;
    background: linear-gradient(transparent,rgba(0,0,0,0.1) 20%,rgba(0,0,0,0.2) 35%,rgba(0,0,0,0.6) 65%,rgba(0,0,0,0.9));
  }
  .day img {
    height: 120px;
    width: 100%;
  }
}
/*mobile*/
@media only screen and (max-width: 768px){
  .day {
    height: 60px;
  }
  .week {
    height: 60px;
  }
  .daytitle {
    height: 28px;
    font-size: 4px;
    overflow: auto;
    line-height: 12px;
    background: linear-gradient(transparent,rgba(0,0,0,0.1) 18%);
  }
  .day img {
    height: 60px;
    width: 100%;
  }
}

.daynum {
  top:0px;
  position: absolute;
  background-color: rgba(0,0,0,0.1);
  width: 20px;
}
.cur .daynum {
  color: #fff;
}
.today .daynum {
  color: #3399ff;
}
.cur:hover {
  cursor: pointer;
}
.pre .daynum{
  color: #cdbfe3;
}
.nex .daynum{
  color: #cdbfe3;
}
</style>
