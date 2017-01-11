<template>
<div>
  <div>
    <app-locations :oncity="onCity"></app-locations>
    <app-calendar :oncity="onCity" :refresh="homeRefresh" :userid="userId"></app-calendar>
  </div>
  <app-activitys v-if="showActivitys" :ondate='onDate' :oncity="onCity" :refresh="homeRefresh" :userid="userId"></app-activitys>
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
      userId: null,
    }
  },
  activated() {
    this.showHome();
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
  methods: {
    showHome() {
      if (this.$route.query && this.$route.query.userId) {
        this.userId = this.$route.query.userId;
      } else {
        this.userId = null;
      }
    }
  },
  props:['refresh'],
  watch: {
    refresh(val) {
      if (val&&val.includes('home')) {
        this.homeRefresh = val;
        this.showHome()
      }
    },
    '$route' (to, from) {
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
/*computer*/
@media only screen and (min-width: 768px) {
  .locations {
    float: left;
    position: absolute;
    margin-left: 10px;
  }
}
/*mobile*/
@media only screen and (max-width: 768px){
  .locations {
    float: left;
    position: absolute;
    margin-left: 0;
    top: 2.4px;
    left: 4.8em;
  }
}

</style>
