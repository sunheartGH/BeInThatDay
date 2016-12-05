<template>
<div>
  <component v-bind:is="showLogin"></component>
  <component v-bind:is="showCalendar"></component>
  <component v-bind:is="showActivitys" :showdate='showDate'></component>
</div>
</template>

<script>
import Login from '../components/login.vue'
import Calendar from '../components/calendar.vue'
import Activitys from '../components/activitys.vue'


import bus from 'bus'

export default {
  data () {
    return {
      showLogin: 'Login',
      showCalendar: 'Calendar',
      showActivitys: '',
      showDate: '',
    }
  },
  mounted() {
    bus.$on('dayclick', (date) => {
      this.showActivitys = 'Activitys';
      this.showDate = date;
    });
    bus.$on('activityclick', (activityId) => {
      this.$router.push({ name: 'show', params: { activityId }});
    });
  },
  components: {
    Login,
    Calendar,
    Activitys
  }
}
</script>

<style>
</style>
