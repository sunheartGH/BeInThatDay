<template>
<div>
  <div id="treatagslist" class="ui blue labels">
    <a class="ui tag label" v-for="(tag, index) in tags">
      {{tag.name}}
      <i class="delete icon" @click="tags.splice(index,1)"></i>
    </a>
  </div>
  <div class="ui search treatags fluid">
    <div class="ui right action left icon input">
      <i class="delete link icon" v-if="tagSearch" @click="deleteSearch"></i>
      <i class="search icon" v-else></i>
      <input type="text" class="prompt" placeholder="Search Tag..." v-model="tagSearch">
      <select class="ui compact selection dropdown" v-model="searchType">
        <option v-for="item in searchTypes" :value="item">
          {{item}}
        </option>
      </select>
      <div class="ui button" @click="createTag">create</div>
    </div>
    <div class="results"></div>
  </div>
  <div id="treatagparent" class="ui pointing label" v-if="parentName">
    Parent Tag:{{parentName}}
    <i class="delete icon" @click="deleteParent"></i>
  </div>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'

const TAG = "Tag"
const PARENT = "Parent"
export default {
  data () {
    return {
      parentTag:null,
      parentName:null,
      tagSearch:null,
      searchType: TAG,
      searchTypes: [TAG, PARENT],
    }
  },
  mounted() {
    this.trickyInit();
  },
  methods: {
    trickyInit() {
      let vm = this;
      let tagsSearchApi = this.$http.options.root+'/tags/search';
      $('.ui.search.treatags').search({
        minCharacters : 2,
        apiSettings : {
          url: tagsSearchApi+'?name={query}',
          method:"GET",
          beforeSend (settings) {
            let parent;
            if (vm.searchType == TAG && vm.parentTag) {
              parent = vm.parentTag;
            }
            let params = {
              parent: parent,
              lastime: utils.dateFormat(new Date()),
            }
            utils.useToken(params);
            settings.data = params;
            return settings;
          },
          onResponse (res) {
            if (res.meta && res.meta.status=="ok"
              && res.meta.code==200 && res.result) {

              let tags = res.result.tags;
              tags.forEach((e) => {
                e.title = e.name;
              })
              return {results:tags}
            } else {
              console.log(res);
            }
          },
        },
        searchDelay: 480,
        onSelect(tag, response) {
          if (vm.searchType == PARENT) {
            vm.parentTag = tag.id;
            vm.parentName = tag.name;
          } else if (vm.searchType == TAG) {
            let tagIds = vm.tags.map(e => e.id);
            if (!tagIds.includes(tag.id)) {
              vm.tags.push(tag);
            } else {
              alert("tag has existed")
            }
          } else {
            alert("something wrong")
          }
        },
      });
      $('.ui.search.treatags .ui.compact.selection.dropdown').dropdown({
        onChange: (value, text, $selectedItem) => {
          this.searchType = value.trim();
        }
      });
    },
    createTag() {
      if (this.tagSearch) {
        if (this.searchType == PARENT) {
          alert("can't create tag")
          return;
        }
        if (this.tagSearch.length < 2 || this.tagSearch.length > 64) {
          alert("tag name length is unlegal")
          return;
        }
        let tagNames = this.tags.map(e => e.name);
        let parent;
        if (this.parentTag && this.parentName) {
          parent = this.parentTag;
          tagNames.push(this.parentName)
        }
        if (tagNames.includes(this.tagSearch)) {
          alert("tag already exists")
          return;
        }
        let params = {};
        utils.useToken(params);
        let body = {
          name: this.tagSearch,
          parent,
        }
        this.$http.post("tag",body,{params}).then((res) => {
          if (utils.isResOk(res)) {
            let tag = res.body.result.tag;
            if (tag) {
              this.tags.push(tag);
            }
          }
        }).catch((err) => {
          console.log(err);
        });
      } else {
        alert("tag is invalid");
      }
    },
    deleteSearch() {
      this.tagSearch = null;
    },
    deleteParent() {
      this.parentTag = null;
      this.parentName = null;
    }
  },
  props:['tags'],
}
</script>

<style>
/*#treatagslist {
  float: left;
  margin-top: 0.4em
}
#treatagparent {
  float: left;
  margin-top: 0.4em
}
.ui.search.treatags {
  float: left;
}
.ui.search.treatags input.prompt{
  min-width: 100%;
}
.ui.search.treatags .ui.compact.selection.dropdown{
  min-width: 6em;
}*/
.ui.search.treatags .results{
  width: 16em;
}
.ui.search.treatags .results .result .content .title{
  text-align: left;
}
</style>


<!--
<template>
<div>
  <span>
    <a v-for="(tag, index) in tags">
      {{tag.name}}
      <i @click="tags.splice(index,1)"></i>
    </a>
  </span>
  <div>
    <input type="text" v-model="parentSearch" @keyup="toSearchTags(searchType.onParent)" placeholder="Parent search...">
    <input type="text" v-model="tagSearch" @keyup="toSearchTags(searchType.onTag)" placeholder="Tag search...">
    <button @click="createTag">create</button>
    <div>
      <div v-for="tag in searchTags" @click="choiceTag(tag)">
        {{tag.name}}
      </div>
    </div>
  </div>
</div>
</template>
<script>
import bus from 'bus'
import utils from 'utils'

export default {
  data () {
    return {
      searchTags:[],
      parentTag:null,
      parentSearch:null,
      tagSearch:null,
      searchType: {
         onParent: 1,
         onTag: 2,
      },
      curSearchType:null,
    }
  },
  mounted() {
  },
  methods: {
    toSearchTags: utils.debounce(function (type) {
      let name;
      let parent;
      if (type == this.searchType.onParent) {
        this.curSearchType = this.searchType.onParent;
        if (this.parentSearch && this.parentSearch.length >=2) {
          name = this.parentSearch;
        } else {
          this.parentTag = null;
          this.searchTags = [];
          return;
        }
      } else if (type == this.searchType.onTag) {
        this.curSearchType = this.searchType.onTag;
        if (this.parentTag) {
          parent = this.parentTag;
        }
        if (this.tagSearch && this.tagSearch.length >=2) {
          name = this.tagSearch;
        } else {
          this.searchTags = [];
          return;
        }
      } else {
        alert("something wrong");
        return;
      }
      let params = {
        name,
        parent,
        lastime: utils.dateFormat(new Date()),
      };
      utils.useToken(params);
      this.$http.get("tags/search",{params}).then((res) => {
        if (utils.isResOk(res)) {
          let tags = res.body.result.tags;
          this.searchTags = tags;
        }
      }).catch((err) => {
        console.log(err);
      });
    }, 480),
    choiceTag(tag) {
      if (tag) {
        if (this.curSearchType == this.searchType.onParent) {
          this.parentTag = tag.id;
          this.parentSearch = tag.name;
        } else if (this.curSearchType == this.searchType.onTag) {
          let tagIds = this.tags.map(e => e.id);
          if (!tagIds.includes(tag.id)) {
            this.tags.push(tag);
          } else {
            alert("tag has existed")
          }
        } else {
          alert("something wrong")
        }
      }
    },
    createTag() {
      if (!this.searchTags.length && this.tagSearch) {
        if (this.tagSearch.length < 2 || this.tagSearch.length > 64) {
          alert("tag name length is unlegal")
          return;
        }
        let params = {};
        utils.useToken(params);
        let body = {
          name: this.tagSearch,
          parent: null,
        }
        if (this.parentTag) {
          body.parent = this.parentTag;
        }
        this.$http.post("tag",body,{params}).then((res) => {
          if (utils.isResOk(res)) {
            let tag = res.body.result.tag;
            if (tag) {
              this.tags.push(tag);
              this.searchTags.push(tag);
            }
          }
        }).catch((err) => {
          console.log(err);
        });
      } else {
        alert("tag is invalid");
      }
    },
  },
  props:['tags'],
}
</script>

<style>
</style>
-->
