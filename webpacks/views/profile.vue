<template>
<div>
  <app-user :userid='userId' :refresh="userRefresh"></app-user>
  <app-uinfos :userid='userId'></app-uinfos>
</div>
</template>

<script>
import bus from "bus";
import utils from "utils";
import User from '../components/user.vue'
import UserInfos from '../components/user_infos.vue'

export default {
  data () {
    return {
      userId: null,
      userRefresh: 0,
    }
  },
  activated() {
    this.showProfile();
  },
  mounted() {
  },
  methods: {
    showProfile() {
      if (this.$route.params.userId) {
        this.userId = this.$route.params.userId;
      }
    }
  },
  props:['refresh'],
  watch: {
    refresh(val) {
      if (val&&val.includes('profile')) {
        this.userRefresh = val;
      }
    },
    '$route' (to, from) {
      this.showProfile();
    }
  },
  components: {
    "app-user": User,
    "app-uinfos": UserInfos,
  },
}
</script>

<style>
</style>
