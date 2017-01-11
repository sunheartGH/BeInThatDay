<template>
<div>
  <app-sactivitys></app-sactivitys>
</div>
</template>

<script>
import bus from "bus";
import utils from "utils";
import SearchActivitys from '../components/search_activitys.vue'

export default {
  data () {
    return {
    }
  },
  activated() {
  },
  mounted() {
  },
  methods: {
  },
  // props:['refresh'],
  watch: {
    // refresh(val) {
    // },
  },
  components: {
    "app-sactivitys": SearchActivitys,
  },
}
</script>

<style>
</style>
