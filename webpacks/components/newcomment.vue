<template>
<div class="addcomment">
  <textarea v-model="commentContent"></textarea>
  <button type="button" v-on:click="addComment" v-bind:disabled="butable">submit</button>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'

export default {
  data() {
    return {
      commentContent: null,
      butable: false,
    }
  },
  methods: {
    addComment() {
      console.log(this.under);
      if (this.under.object && this.under.type && this.commentContent) {
        this.butable = true;
        let params = {};
        let body = {
          under_object: this.under.object,
          under_type: this.under.type,
          content: this.commentContent
        };
        utils.useToken(params);
        this.$http.post("/comment", body, {params}).then((res) => {
          if (utils.isResOk(res)) {
            let comment = res.body.result.comment;
            if (comment) {
              alert('add comment success');
              this.butable = false;
            }
          } else {
            this.butable = false;
          }
        }).catch((err) => {
          console.log(err);
          this.butable = false;
        });
      }
    }
  },
  props: ['under'],
}
</script>

<style>
</style>
