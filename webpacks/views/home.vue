<template>
<div>
  <div>
    <app-locations class="homelocations" :oncity="onCity"></app-locations>
    <app-calendar :oncity="onCity" :refresh="homeRefresh"></app-calendar>
  </div>
  <app-activitys v-if="showActivitys" :ondate='onDate' :oncity="onCity" :refresh="homeRefresh"></app-activitys>
</div>
</template>

<script>
import Calendar from '../components/calendar.vue'
import Activitys from '../components/activitys.vue'
import Locations from '../components/locations.vue'

import bus from 'bus'
import utils from 'utils'

export default {
  data () {
    return {
      showActivitys: false,
      onDate: '',
      onCity: '',
      homeRefresh: 0,
    }
  },
  mounted() {
    bus.$on('dayclick', (date) => {
      this.showActivitys = true;
      this.onDate = date;
    });
    bus.$on('locationchanged', (location) => {
      this.onCity = location.city;
    });
  },
  props:['refresh'],
  watch: {
    refresh(val) {
      if (val&&val.includes('home')) {
        this.homeRefresh = val;
      }
    },
    '$route' (to, from) {
      if (this.$router.params) {
        console.log(this.$router.params.userId);
      }
    }
  },
  components: {
    "app-calendar": Calendar,
    "app-activitys": Activitys,
    "app-locations": Locations,
  },
}
</script>

<style>
.homelocations.search.locations {
  float: left;
  position: absolute;
  margin-left: 10px;
}
</style>
