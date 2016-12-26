<template>
<div class="ui category search locations">
  <div class="ui left icon input">
    <i class="delete link icon" v-if="selection" @click="deleteSelection"></i>
    <i class="marker icon" v-else></i>
    <input class="prompt" type="text" placeholder="Search locations..." v-model="locationSearch" @focusout="focusOut">
  </div>
  <div class="results"></div>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'

export default {
  data () {
    return {
      selection: null,
      locationSearch: null,
    }
  },
  mounted() {
    this.trickyInit();
    this.selection = this.oncity;
    this.locationSearch = this.oncity;
  },
  methods: {
    trickyInit() {
      let vm = this;
      function putCitys (results) {
        $('.ui.category.search.locations').search({
          apiSettings: {
            response: {results},
            onResponse (res) {
              let reallyRes = {results:{}};
              if (vm.locationSearch) {
                let search = vm.locationSearch.trim();
                if (search) {
                  let keys = Object.keys(res.results);
                  for (let h = 0; h < keys.length; h++) {
                    let key = keys[h];
                    let results = res.results[key].results;
                    for (let i = 0; i < results.length; i++) {
                      let city = results[i];
                      if (city.city.includes(search) || city.province.includes(search)) {
                        if (!reallyRes.results[city.province]) {
                          reallyRes.results[city.province] = {province:city.province, results:[]}
                        }
                        reallyRes.results[city.province].results.push(city);
                      }
                    }
                  }
                }
              }
              return reallyRes;
            },
          },
          onSelect(location, response) {
            vm.locationSearch = location.city;
            vm.selection = location.city;
            bus.$emit("locationchanged", location);
          },
          minCharacters: 2,
          fields: {
            categoryName: 'province',
            title: 'city',
            name: 'province',
          },
          searchDelay: 480,
          type: 'category',
        });
      }
      let localLocations = utils.getLocations();
      if (localLocations) {
        putCitys(localLocations);
      } else {
        this.commonLocations(function(locations){
          let results = {}
          locations.forEach((e, i, a) => {
            if (e.province && !results[e.province]) {
              results[e.province] = {province: e.province,results: []}
            }
            results[e.province].results.push(e);
          })
          utils.storeLocations(results);
          putCitys(results);
        })
      }
    },
    commonLocations(callback){
      let params = {};
      utils.useToken(params);
      this.$http.get("locations/common",{params}).then((res) => {
        if (utils.isResOk(res)) {
          let locations = res.body.result.locations;
          if (locations) {
            callback(locations);
          }
        }
      }).catch((err) => {
        console.log(err);
      });
    },
    deleteSelection() {
      this.locationSearch = null;
      this.selection = null;
      bus.$emit("locationchanged", '');
    },
    focusOut() {
      setTimeout(() => {
        if (this.locationSearch != this.selection) {
          this.locationSearch = this.selection
        }
      }, 100)
    }
  },
  props: ['oncity']
}
</script>

<style>
.ui.category.search.locations .results{
  width: 20em;
}
.ui.category.search.tlocations .results .category .result .content .title {
  text-align: left;
}
</style>




<!-- <template>
<div class="ui floating dropdown labeled search icon button locations">
  <i class="marker icon"></i>
  <span class="text">{{ selection }}</span>
  <div class="menu">
    <div class="item">深圳</div>
    <div class="item">广州</div>
    <div class="item">北京</div>
    <div class="item">上海</div>
    <div class="item">杭州</div>
    <div class="item">武汉</div>
    <div class="item">重庆</div>
    <div class="item">四川</div>
    <div class="item">西安</div>
    <div v-for="location in locations" class="item" @click="onChange(location)">{{ location.city }}</div>
  </div>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'

export default {
  data () {
    return {
      selection:"深圳",
      locations:null,
    }
  },
  mounted() {
    // this.commonLocations();
    $('.ui.dropdown.locations').dropdown();
  },
  methods: {
    commonLocations(){
      let params = {};
      utils.useToken(params);
      this.$http.get("locations/common",{params}).then((res) => {
        if (utils.isResOk(res)) {
          let locations = res.body.result.locations;
          if (locations) {
            this.locations = locations;
          } else {
            this.locations = [];
          }
        }
      }).catch((err) => {
        console.log(err);
      });
    },
    onChange(location) {
      this.selection = location.city;
      bus.$emit("locationchanged", {type: "city", data: this.selection});
    },
  },
}
</script>

<style>
</style> -->

<!-- <div id="editor">
  <select v-model="selection">
    <option v-for="option in options" :value="option">
      {{ option.text }}
    </option>
  </select>
  <span>selection: {{ selection.value }}</span>
</div>
new Vue({
  el: '#editor',
  data: {
    selection: { text: 'One', value: 'A' },
    options: [
      { text: 'One', value: 'A' },
      { text: 'Two', value: 'B' },
      { text: 'Three', value: 'C' }
    ]
  }
}) -->
