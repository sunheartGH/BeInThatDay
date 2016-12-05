<template>
<div>
  <component v-bind:is="showUser" :userid='userId'></component>
</div>
</template>

<script>
import User from '../components/user.vue'

export default {
  data () {
    return {
      showUser: 'User',
      userId: this.$route.params.userId,
    }
  },
  activated() {
    this.userId = this.$route.params.userId;
  },
  mounted() {
    // this.showUser = 'User';
  },
  components: {
    User
  }
  // components: {
  //   User (resolve) {
  //     require(['../components/user.vue'], resolve);
  //   }
  // }
}
</script>

<style>
</style>
