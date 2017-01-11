<template>
<div class="login">
  <div class="ui horizontal list" v-if="user">
    <div class="item" @click="userClick(user.id)">
      <img class="ui avatar image" :src="user.avatar">
      <div class="content">
        {{user.nickname}}
      </div>
    </div>
    <div class="item">
      <div class="ui tiny teal button" @click="toLogout">Logout</div>
    </div>
  </div>
  <div class="ui horizontal list" v-else>
    <div class="item">
      <div class="ui tiny button" @click="showSignup">Signup</div>
    </div>
    <div class="item" @click="showLogin">
      <div class="ui tiny teal button">Login</div>
    </div>
  </div>

  <div class="ui modal login">
    <i class="close icon"></i>
    <div class="header">
      Login
    </div>
    <div class="content">
      <div class="ui form">
        <div class="field">
          <label>Account</label>
          <input type="text" placeholder="account" v-model="account">
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" placeholder="password" v-model="password">
        </div>
        <div class="field">
          <label>Captcha</label>
          <div class="ui action input">
            <input type="text" placeholder="captcha" v-model="captchatext" maxlength='4'>
            <img class='ui image' :src="captchaimg">
            <button class="ui teal right button" @click="reloadCaptcha" :disabled="recaptime"> Reload <span v-if="recaptime">({{recaptime}})</span></button>
          </div>
        </div>
      </div>
    </div>
    <div class="actions">
      <div class="ui button" @click="hideLogin">Cancel</div>
      <div class="ui green button" @click="toLogin">Login</div>
    </div>
  </div>

  <div class="ui modal signup">
    <i class="close icon"></i>
    <div class="header">
      Signup
    </div>
    <div class="content">
      <div class="ui form">
        <div class="field">
          <label>Nickname</label>
          <input type="text" placeholder="nickname" v-model="nickname">
        </div>
        <div class="field">
          <label>Account</label>
          <input type="text" placeholder="account" v-model="account">
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" placeholder="password" v-model="password">
        </div>
        <div class="field">
          <label>Captcha</label>
          <div class="ui action input">
            <input type="text" placeholder="captcha" v-model="captchatext" maxlength='4'>
            <img class='ui image' :src="captchaimg">
            <button class="ui teal right button" @click="reloadCaptcha" :disabled="recaptime"> Reload <span v-if="recaptime">({{recaptime}})</span></button>
          </div>
        </div>
      </div>
    </div>
    <div class="actions">
      <div class="ui button" @click="hideSignup">Cancel</div>
      <div class="ui green button" @click="toSignup">Signup</div>
    </div>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'
import validator from 'validator'

export default {
  data () {
    return {
      nickname: '',
      account: '',
      password: '',
      user: null,
      captchaid: '',
      captchatext: '',
      captchaimg: '',
      recaptime: false,
    }
  },
  mounted() {
    this.showUser();
  },
  methods: {
    userClick(uid) {
      if (uid) {
        bus.$emit("userclick", uid);
      }
    },
    showUser() {
      if (utils.haveToken() && utils.haveUser()) {
        let user = utils.getUser();
        this.user = user;
      } else {
        this.user = null;
      }
    },
    showLogin() {
      this.captchatext = '';
      this.captchaid = '';
      this.captchaimg = '';
      $('.ui.modal.login').modal('show');
      this.getCaptcha()
    },
    getCaptcha () {
      this.$http.get("captcha").then((res) => {
        if (utils.isResOk(res)) {
          this.captchaimg = res.body.result.captcha.img;
          this.captchaid = res.body.result.captcha.id;
        }
      }).catch((err) => {
        console.log(err);
      });
    },
    reloadCaptcha () {
      this.getCaptcha();
      let rtime = 3;
      this.recaptime = rtime;
      let recap = setInterval(() => {
        this.recaptime--
      }, 1000);
      setTimeout(() => {
        this.recaptime = false;
        clearInterval(recap)
      }, rtime * 1000);
    },
    showSignup() {
      this.captchatext = '';
      this.captchaid = '';
      this.captchaimg = '';
      $('.ui.modal.signup').modal('show');
      this.getCaptcha()
    },
    hideLogin() {
      $('.ui.modal.login').modal('hide');
    },
    hideSignup() {
      $('.ui.modal.signup').modal('hide');
    },
    toLogin () {
      if(this.account && this.password){
        if(utils.haveToken()){
         alert("has logined");
         return
        }
        if (!this.captchatext || !this.captchaid) {
          alert("should input captcha");
          return
        }
        //没有toekn,获取token
        let body = {
          password: this.password,
          captcha: {
            id: this.captchaid,
            text: this.captchatext,
          }
        }
        if (validator.isEmail(this.account)) {
          body.email = this.account;
        } else if (validator.isMobilePhone(this.account, "zh-CN")) {
          body.phone = this.account;
        } else {
          body.username = this.account;
        }

        this.$http.post("token/auth",body).then((res) => {
          if (utils.isResOk(res)) {
            let token = res.body.result.token;
            //保存token
            utils.storeToken(token);
            let user = res.body.result.user;
            utils.storeUser(user);
            this.hideLogin();
            this.showUser();
            bus.$emit("logined");
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    },
    toSignup () {
      if(this.nickname && this.account && this.password){
        if(utils.haveToken()){
         alert("has logined");
         return
        }
        if (!this.captchatext || !this.captchaid) {
          alert("should input captcha");
          return
        }
        //没有toekn,获取token
        let body = {
          password: this.password,
          nickname: this.nickname,
          captcha: {
            id: this.captchaid,
            text: this.captchatext,
          }
        }
        if (validator.isEmail(this.account)) {
          body.email = this.account;
        } else if (validator.isMobilePhone(this.account, "zh-CN")) {
          body.phone = this.account;
        } else {
          body.username = this.account;
        }

        this.$http.post("user",body).then((res) => {
          if (utils.isResOk(res)) {
            let token = res.body.result.token;
            //保存token
            utils.storeToken(token);
            let user = res.body.result.user;
            utils.storeUser(user);
            this.hideSignup();
            this.showUser();
            bus.$emit("logined");
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    },
    toLogout() {
      if(utils.haveToken()){
        let ifConfirm = confirm("Confirm to exit");
        if (ifConfirm) {
          let params = {};
          utils.useToken(params);
          this.$http.delete("token/cancel",{
            params
          }).then((res) => {
            if (utils.isResOk(res)) {
              utils.clearAuth();
              alert("logouted");
              this.showUser();
              bus.$emit("logouted");
            }
          }).catch((err) => {
            console.log(err);
          });
        }
      } else {
        alert("you should login");
      }
    }
  }
}
</script>

<style>

</style>
