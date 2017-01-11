<template>
<div class="ui form segment treatuser">
  <h4 class="ui dividing header">Treat User</h4>
  <div class="fields">
    <div class="eight wide field">
      <label>Nickname</label>
      <input type="text" v-model="user.nickname" placeholder="nickname">
    </div>
    <div class="eight wide field">
      <label>Gender</label>
      <select class="ui dropdown gender">
        <option v-for="gender in genders" :value="gender.value">
          {{gender.text}}
        </option>
      </select>
    </div>
  </div>
  <div class="field">
    <label>Avatar</label>
    <input type="text" v-model="user.avatar" placeholder="avatar">
  </div>
  <div class="field">
    <label>Home</label>
    <input type="text" v-model="user.home" placeholder="home">
  </div>
  <div class="field">
    <label>Tags</label>
    <app-treattags :tags="user.tags"></app-treattags>
  </div>
  <div class="field">
    <label>Depict</label>
    <textarea v-model="user.depict" placeholder="depict..." rows="2"></textarea>
  </div>
  <div class="ui submit button" @click="treatUser">Save</div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'
import validator from 'validator'
import TreatTags from './treat_tags.vue'

export default {
  data () {
    return {
      user:{
        id: null,
        nickname: null,
        gender: 'man',
        avatar: null,
        home: null,
        depict: null,
        tags: [],
      },
      genders: [
        {text: 'Woman', value: 'woman'},
        {text: 'Man', value: 'man'},
      ],
      raw: {},
    }
  },
  mounted() {
    if (this.treat) {
      this.putUser(this.treat.data);
    }
  },
  methods: {
    putUser(udata) {
      if (udata && udata.id) {
        let keys = Object.keys(this.user);
        let rawData = JSON.parse(JSON.stringify(udata));

        for (let key of keys) {
          if (udata[key]) {
            this.user[key] = udata[key];
            this.$set(this.raw, key, rawData[key]);
          }
        }

        //v-model在下拉选择中无法显示，用jquery手动设置，绑定的值还是会关联
        $(".ui.dropdown.gender").dropdown("set selected", this.user.gender);
        $(".ui.dropdown.gender").dropdown({
          onChange: (value, text, $selectedItem) => {
            this.user.gender = value;
          }
        });
      }
    },
    treatUser () {
      if(this.user.id && utils.ifUser(this.user.id)
        && utils.haveToken() && this.validUser(this.user)){

        let keys = Object.keys(this.user);
        let body = {};
        let go = false;
        for (let key of keys) {
          if (this.user[key] && this.raw[key] &&
            this.user[key]+"" != this.raw[key]+"") {

            body[key] = this.user[key];
            go = true;
          }
        }

        let tagIds = this.user.tags.map(e => e.id);
        let rawTagIds = this.raw.tags.map(e => e.id);
        if (tagIds.sort().toString() != rawTagIds.sort().toString()) {
          body.tags = tagIds;
          go = true;
        }

        if (go) {
          let params = {};
          utils.useToken(params);

          //添加loading图
          $(".ui.form.segment.treatuser").toggleClass("loading");
          this.$http.put("user", body, {params}).then((res) => {
            if (utils.isResOk(res)) {
              let result = res.body.result;
              if (result && Object.keys(result)) {
                alert('treat user success');

                //操作完成，发出事件
                bus.$emit("usertreated", this.user.id);
              } else {
                alert('no user field changed');
              }
            }
          }).catch((err) => {
            console.log(err);
          }).finally(()=>{
            //移除loading图
            $(".ui.form.segment.treatuser").toggleClass("loading");
          })
        }
      } else {
        alert("Invalid Failed")
      }
    },
    validUser(user) {
      let {nickname,gender,avatar,home,depict,tags} = user;
      if (nickname) {
        if (nickname < 2 || nickname > 32) {
          alert("nickname length is unlegal");
          return;
        }
      }
      if (gender) {
        if (!utils.UserGender[gender]) {
          alert("gender is wrong");
          return;
        }
      }
      if (avatar) {
        if (!validator.isURL(avatar)) {
          alert("avatar must be url");
          return;
        }
      }
      if (home) {
        if (!validator.isURL(home)) {
          alert("home must be url");
          return;
        }
      }
      if (depict) {
        if (depict.length < 8 || depict.length > 256) {
          alert("depict length is unlegal");
          return;
        }
      }
      if (tags) {
        if (Array.isArray(tags)) {
          for (let tag of tags) {
            if (!utils.objectIdValid(tag)) {
              alert("tag: "+tag+" should be id type");
              return;
            }
          }
        } else {
          alert("tags should be array type");
          return;
        }
      }
      return true;
    }
  },
  props: ["treat"],
  watch: {
    treat(val, old) {
      if (val) {
        this.putUser(val.data);
      }
    }
  },
  components: {
    "app-treattags":TreatTags
  }
}
</script>

<style>
.ui.form.segment.treatuser {
  margin: 0.5em;
}
</style>
