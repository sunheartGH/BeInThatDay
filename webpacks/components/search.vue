<template>
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
</style>
