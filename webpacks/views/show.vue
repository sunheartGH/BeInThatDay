<template>
<div>
  <component v-bind:is="showActivity" :activityid='activityId'></component>
  <component v-bind:is="showNewComment" :under='theUnder'></component>
  <component v-bind:is="showComments" :under='theUnder'></component>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'
import Activity from '../components/activity.vue'
import Comments from '../components/comments.vue'
import NewComment from '../components/newcomment.vue'

export default {
  data () {
    return {
      showActivity: 'Activity',
      showComments: 'Comments',
      showNewComment: 'NewComment',
      activityId: this.$route.params.activityId,
      theUnder: {
        object: this.$route.params.activityId,
        type: 'Subject',
      }
    }
  },
  activated() {
    this.activityId = this.$route.params.activityId;
    this.theUnder = {
      object: this.activityId,
      type: 'Subject',
    }
  },
  mounted() {
    bus.$on('userclick', (userId) => {
      if (utils.haveToken()) {
        this.$router.push({ name: 'profile', params: { userId }});
      } else {
        alert("you should login");
      }
    });
  },
  components: {
    Activity ,
    Comments,
    NewComment
  }
}
</script>

<style>
</style>
