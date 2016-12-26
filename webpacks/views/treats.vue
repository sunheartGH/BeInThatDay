<template>
<div>
  <component :is="showTreat" :treat='treat'></component>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'
import TreatUser from '../components/treat_user.vue'
import TreatActivity from '../components/treat_activity.vue'

export default {
  data () {
    return {
      showTreat: '',
      treat: null,
    }
  },
  activated() {
    this.treat = this.$route.params.treat;
    if (this.treat) {
      if (this.treat.type == "activitytreat") {
        this.showTreat = "app-treatactivity";
      } else if (this.treat.type == "usertreat") {
        this.showTreat = "app-treatuser";
      }
    }
  },
  mounted() {
  },
  components: {
    "app-treatuser":TreatUser,
    "app-treatactivity":TreatActivity
  },
}
</script>

<style>
</style>
