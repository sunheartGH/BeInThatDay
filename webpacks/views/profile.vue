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
  components: {
    User
  }
}
</script>

<style>
</style>
