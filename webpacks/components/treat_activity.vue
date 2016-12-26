<template>
<div>
  <div class="ui form segment treatactivity">
    <h4 class="ui dividing header">Treat Activity</h4>
    <div class="fields">
      <div class="twelve wide field">
        <label>Title</label>
        <input type="text" v-model="activity.title" placeholder="title" :readonly="refable">
      </div>
      <div class="two wide field">
        <label>Expose Level</label>
        <select class="ui dropdown exposelevel" v-model="activity.expose_level">
          <option v-for="expose in exposes" :value="expose.value">
            {{expose.text}}
          </option>
        </select>
      </div>
      <div class="two wide field">
        <label>Fee</label>
        <input type="number" v-model="activity.fee" placeholder="fee" :readonly="refable">
      </div>
    </div>
    <div class="two fields">
      <div class="field">
        <label>Cover Picurl</label>
        <input type="text" v-model="activity.cover_picurl" placeholder="cover_picurl" :readonly="refable">
      </div>
      <div class="field">
        <label>Site</label>
        <input type="text" v-model="activity.site" placeholder="site" :readonly="refable">
      </div>
    </div>
    <div class="two fields">
      <div class="field">
        <label>Start Time</label>
        <input type="datetime-local" v-model="activity.start_time" placeholder="start_time" :readonly="refable">
      </div>
      <div class="field">
        <label>End Time</label>
        <input type="datetime-local" v-model="activity.end_time" placeholder="end_time" :readonly="refable">
      </div>
    </div>
    <div class="two fields">
      <div class="field">
        <label>Tags</label>
        <app-treattags :tags="activity.tags"></app-treattags>
      </div>
      <div class="field">
        <label>Location</label>
        <app-treatlocation :locationed="activity.location"></app-treatlocation>
      </div>
    </div>
    <div class="field">
      <label>Content</label>
      <div id="editor"></div>
    </div>
    <div class="ui submit button" @click="treatActivity">Save</div>
  </div>
</div>
</template>

<script>
import utils from 'utils'
import bus from 'bus'
import validator from 'validator'
import moment from 'moment'
import Quill from 'quill'
import TreatTags from './treat_tags.vue'
import TreatLocation from './treat_location.vue'

let quill;

export default {
  data () {
    return {
      activity:{
        id: null,
        title: null,
        cover_picurl: null,
        summary: null,
        content: null,
        site: null,
        start_time: null,
        end_time: null,
        fee: null,
        expose_level: "Public",
        tags: [],
        location: {},
      },
      exposes:[
        {text: 'Public', value: 'Public'},
        {text: 'Friend', value: 'Friend'},
        {text: 'Coterie', value: 'Coterie'},
        {text: 'Private', value: 'Private'},
      ],
      creater: null,
      raw: {},
      refable: false,
      quillrender: false,
    }
  },
  mounted() {
    if (!this.quillrender) {
      let toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'link', 'image'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean'],
      ];
      quill = new Quill('#editor', {
        placeholder: "content...",
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image:  function imageHandler() {
                let range = this.quill.getSelection();
                let tooltip = this.quill.theme.tooltip;
                let tooltipedit = 'image';
                tooltip.edit(tooltipedit);
                let _save = tooltip.save;
                tooltip.save = function () {
                  let value = this.textbox.value;
                  _save.call(this);
                  if (value && tooltipedit) {
                    this.quill.insertEmbed(range.index, 'image', value, Quill.sources.USER);
                  }
                  tooltipedit = '';
                };
              }
            }
          },
        },
        theme: "snow"
      });
      this.quillrender = true;
    }

    if (this.treat) {
      this.putActivity(this.treat.data);
    }

  },
  methods: {
    putActivity(adata) {
      if (adata && adata.id && utils.ifUser(adata.creater.id)) { //有id,为修改
        if (!utils.ifUser(adata.refer_object.creater.id)) {
          this.refable = true;
        }
        adata.refer_object.start_time = moment(adata.refer_object.start_time).format("YYYY-MM-DDTHH:mm")
        adata.refer_object.end_time = moment(adata.refer_object.end_time).format("YYYY-MM-DDTHH:mm")

        let rawData = JSON.parse(JSON.stringify(adata));

        let keys = Object.keys(this.activity);
        for (let key of keys) {
          if (adata.refer_object[key]) {
            this.activity[key] = adata.refer_object[key];
            this.$set(this.raw, key, rawData.refer_object[key]);
          }
        }
        this.activity.id = adata.id;
        this.$set(this.raw, "id", rawData.id);
        if (adata.creater) {
          this.creater = adata.creater;
        }
        if (adata.refer_object.content) {
          quill.clipboard.dangerouslyPasteHTML(adata.refer_object.content);
        }

        if (adata.refer_object.location) {
          this.activity.expose_level = adata.refer_object.location;
          this.$set(this.raw, "expose_level", rawData.refer_object.location);
        } else {
          this.activity.location = {};
          this.$set(this.raw, "location", {});
        }

        if (adata.expose_level) {
          this.activity.expose_level = adata.expose_level;
          this.$set(this.raw, "expose_level", rawData.expose_level);
        }

      } else {
        Object.assign(this.$data, this.$options.data());
        quill.clipboard.dangerouslyPasteHTML("");
      }

      $(".ui.dropdown.exposelevel").dropdown("set selected", this.activity.expose_level);
      $(".ui.dropdown.exposelevel").dropdown({
        onChange: (value, text, $selectedItem) => {
          this.activity.expose_level = value.trim();
        }
      });
    },
    treatActivity () {
      if (quill.getText().trim()) {
        this.content = quill.root.innerHTML;
        let summary = quill.getText().trim();
        let summaryLength = 250;
        summary = summary.slice(0, summaryLength);
        if (summary.length == summaryLength) {
          summary += " ...";
        }
        this.summary = summary;
      }
      if(this.activity.id && utils.ifUser(this.creater.id)
        && utils.haveToken()){ //修改

        let keys = Object.keys(this.activity);
        let body = {};
        let go = false;
        for (let key of keys) {
          if (this.activity[key] && this.raw[key] &&
            this.activity[key]+"" != this.raw[key]+"") {

            body[key] = this.activity[key];
            go = true;
          }
        }

        if (this.activity.location && this.activity.location.id) {
          if (!this.raw.location || this.raw.location.id != this.activity.location.id) {
            body.location = this.activity.location.id;
            go = true;
          }
        }

        let tagIds = this.activity.tags.map(e => e.id);
        let rawTagIds = this.raw.tags.map(e => e.id);
        if (tagIds.sort().toString() != rawTagIds.sort().toString()) {
          body.tags = tagIds;
          go = true;
        }

        if (!this.validActivity(body)) {
          return;
        }

        if (go) {
          let params = {};
          utils.useToken(params);

          //添加loading图
          $(".ui.form.segment.treatactivity").addClass("loading");

          this.$http.put("activity/" + this.activity.id, body, {params}).then((res) => {
            if (utils.isResOk(res)) {
              let result = res.body.result;
              if (result && Object.keys(result)) {
                alert('treat activity success');

                //操作完成，发出事件
                bus.$emit("activitytreated");
              } else {
                alert('no activity field changed');
              }
            }

            //移除loading图
            $(".ui.form.segment.treatactivity").removeClass("loading");
          }).catch((err) => {
            console.log(err);

            //移除loading图
            $(".ui.form.segment.treatactivity").removeClass("loading");

          });
        } else {
          alert('no change to save');
        }
      } else if (utils.haveToken()) {//新建
        //判断必要值存在和其类型
        let fields = ["title","cover_picurl","content","summary","start_time","end_time"];
        for (let field of fields) {
          if (!this.activity[field]) {
            alert(field + "can't be null");
            return;
          }
        }

        if (this.activity.location && this.activity.location.id) {
          this.activity.location = this.activity.location.id
        }

        if (this.activity.tags && this.activity.tags.length) {
          let tagIds = this.activity.tags.map(e => e.id);
          this.activity.tags = tagIds;
        }


        if (!this.validActivity(this.activity)) {
          return;
        }

        let params = {};
        utils.useToken(params);

        //添加loading图
        $(".ui.form.segment.treatactivity").addClass("loading");

        this.$http.post("activity", this.activity, {params}).then((res) => {
          if (utils.isResOk(res)) {
            let activity = res.body.result.activity;
            if (activity && activity.id) {
              alert('treat activity success');

              //操作完成，发出事件
              bus.$emit("activitytreated");
            } else {
              alert('treat activity failed');
            }
          }

          //移除loading图
          $(".ui.form.segment.treatactivity").removeClass("loading");
        }).catch((err) => {
          console.log(err);

          //移除loading图
          $(".ui.form.segment.treatactivity").removeClass("loading");
        });

      } else {
        alert("Invalid Failed")
      }
    },
    validActivity(activity) {
      if (activity) {
        let {title,cover_picurl,summary,content,site,start_time,
          end_time,fee,location,expose_level,tags} = activity

        if (title) {
          title = title.trim();
          if (title.length < 4 || title.length > 128) {
            alert("title length is unlegal");
            return;
          }
          activity.title = title;
        }
        if (summary) {
          summary = summary.trim();
          if (summary.length < 16 || summary.length > 256) {
            alert("summary length is unlegal");
            return;
          }
          activity.summary = summary;
        }
        if (content) {
          content = content.trim();
          if (content.length < 16) {
            alert("content length is unlegal");
            return;
          }
          activity.content = content;
        }
        if (start_time) {
          start_time = new Date(start_time.toString());
          if (start_time.getTime() <= new Date().getTime()) {
            alert("start_time must greater than now");
            return;
          }
          activity.start_time = new Date(start_time.getTime() + start_time.getTimezoneOffset()*60000)
        }
        if (end_time) {
          end_time = new Date(end_time.toString());
          if (end_time.getTime() <= new Date().getTime()) {
            alert("end_time must greater than now");
            return;
          }
          activity.end_time = new Date(end_time.getTime() + end_time.getTimezoneOffset()*60000)
        }
        if (cover_picurl) {
          if (!validator.isURL(cover_picurl)) {
            alert("cover_picurl must be url");
            return;
          }
        }
        if (site) {
          if (!validator.isURL(site)) {
            alert("site must be url");
            return;
          }
        }
        if (fee) {
          if (fee < 0) {
            alert("fee must be greater than zero");
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
        if (location) {
          if (!utils.objectIdValid(location)) {
            alert("location should be id type");
            return;
          }
        }
        return true;;
      }
    }
  },
  props: ["treat"],
  watch: {
    treat (val, old) {
      if (val) {
        this.putActivity(val.data)
      }
    },
  },
  components: {
    "app-treattags":TreatTags,
    "app-treatlocation":TreatLocation
  }
}
</script>

<style>
.ui.form.segment.treatactivity {
  margin: 0.5em;
}
.ui.form.segment.treatactivity .ui.dropdown.exposelevel{
  min-width: 0;
}
#editor .ql-editor {
  min-height: 280px;
}
</style>

<!-- watch: {
  treat (val, old) {
    if (!val && old) {
      this.putActivity(old.data);
    } else if (val && (!old || val.data.id != old.data.id)) {
      this.putActivity(val.data);
    } else {
      this.putActivity();
    }
    if (val) {
      this.putActivity(val.data)
    }
  },
  'treat.data' (val, old) {
    if (!val && old) {
      this.putActivity(old);
    } else if (val && (!old || val.id != old.id)) {
      this.putActivity(val);
    } else {
      this.putActivity();
    }
  },
}, -->
