<template>
<div class="ui compact messageshow" v-if="showMessages" @click="messageClick">
  <i class="icon mail"></i> Messages
  <div class="floating ui red label" v-if="count>0">{{count}}</div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'
import io from 'io'

export default {
  data () {
    return {
      count: 0,
      showMessages: false,
    }
  },
  mounted() {
    if (utils.haveToken()) {
      this.showMessages = true;
      let vm = this;
      // let socket = io(this.$http.options.root);
      // socket.on('message', function (data) {
      //   console.log(data);
      //   vm.count++;
      // });
    }
  },
  methods: {
    messageClick() {
      let user = utils.getUser();
      if (user && user.id) {
        bus.$emit("showmessage", user.id);
      }
    }
  }
}
</script>

<style>
@media only screen and (max-width: 768px){
  .messageshow {
    display: none;
  }
}
</style>
