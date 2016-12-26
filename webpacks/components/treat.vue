<template>
<div class="ui primary vertical animated button" @click="toTreat">
  <div class="hidden content">{{title}}</div>
  <div class="visible content">
    <i class="write icon"></i>
  </div>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'

export default {
  data () {
    return {
      title: "NewActivity",
      data: {},
      type: "activitytreat",
    }
  },
  mounted() {
    this.showTreat();
  },
  methods: {
    showTreat() {
      if (this.treat) {
        this.title = this.treat.title;
        this.data = this.treat.data;
        this.type = this.treat.type;
      }
    },
    toTreat() {
      bus.$emit(this.type, {
        title: this.title,
        type: this.type,
        data: this.data,
      });
    }
  },
  props:['treat'],
  watch: {
    'treat' (val) {
      this.showTreat();
    },
    'treat.data' (val) {
      this.showTreat();
    },
  }
}
</script>

<style>
</style>
