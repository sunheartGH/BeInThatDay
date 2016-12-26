<template>
<div class="showdetail">
  <app-activity :activityid='activityId' :refresh="activityRefresh"></app-activity>
  <app-comments class="showcomments" :under='theUnder'></app-comments>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'
import Activity from '../components/activity.vue'
import Comments from '../components/comments.vue'

export default {
  data () {
    return {
      activityId: null,
      theUnder: {},
      activityRefresh: 0,
    }
  },
  activated() {
    this.showActivity();
  },
  mounted() {
  },
  methods: {
    showActivity() {
      if (this.$route.params.activityId) {
        this.activityId = this.$route.params.activityId;
        this.theUnder = {
          object: this.activityId,
          type: 'Subject',
        }
      }
    }
  },
  components: {
    "app-activity":Activity ,
    "app-comments":Comments,
  },
  props:['refresh'],
  watch: {
    refresh(val) {
      if (val&&val.includes('show')) {
        this.activityRefresh = val;
      }
    },
    '$route' (to, from) {
      this.showActivity();
    }
  }
}
</script>

<style>
.showdetail {
  padding-left: 10%;
  padding-right: 10%;
}
.showcomments {
  margin: 1em;
}
</style>
