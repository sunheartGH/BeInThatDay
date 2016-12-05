<template>
<div class="login">
  <input type="text" placeholder="username" v-model="username">
  <input type="text" placeholder="password" v-model="password">
  <button type="button" v-on:click="toLogin" v-bind:disabled="butable">login</button>
  <button type="button" v-on:click="toLogout" v-bind:disabled="butable">logout</button>
</div>
</template>

<script>
import utils from 'utils'

export default {
  data () {
    return {
      username: '',
      password: '',
      butable: false,
    }
  },
  methods: {
    toLogin () {
      if(this.username && this.password){
         if(utils.haveToken()){
           alert("has login");
           return
         }
        //没有toekn,获取token
        this.butable = true;
        this.$http.post("/token/auth",{
          username: this.username,
          password: this.password,
        }).then((res) => {
          if (utils.isResOk(res)) {
            let token = res.body.result.token;
            //保存token
            utils.storeToken(token);
            alert("logined");
          }
          this.butable = false;
        }).catch((err) => {
          console.log(err);
        });
      }
    },
    toLogout() {
      if(utils.haveToken()){
        this.butable = true;
        let params = {};
        utils.useToken(params);
        this.$http.delete("/token/cancel",{
          params
        }).then((res) => {
          if (utils.isResOk(res)) {
            utils.clearToken();
            alert("logouted");
          }
          this.butable = false;
        }).catch((err) => {
          console.log(err);
        });
      } else {
        alert("you should login");
      }
    }
  }
}
</script>

<style>

</style>
