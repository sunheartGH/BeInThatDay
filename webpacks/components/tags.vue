<template>
<span class="ui blue labels">
  <a class="ui tag label" v-for="tag in tags">{{tag.name}}</a>
</span>
</template>

<script>
import utils from 'utils'
import bus from 'bus'

export default {
  data() {
    return {
    }
  },
  methods: {
  },
  props:['tags']
}
</script>

<style>
</style>
