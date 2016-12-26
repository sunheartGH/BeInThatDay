<template>
<div>
  <div class="ui blue label" v-if="showlocation.address">
    Address: {{showlocation.address}}
    <div class="detail">Province: {{showlocation.province}}, City: {{showlocation.city}}</div>
    <i class="delete icon" @click="deleteLocation"></i>
  </div>
  <div class="ui category search treatlocation">
    <div class="ui right action left icon input">
      <i class="delete link icon" v-if="locationSearch" @click="deleteSearch"></i>
      <i class="search icon" v-else></i>
      <input class="prompt" type="text" placeholder="Search locations..." v-model="locationSearch">
      <select class="ui compact selection dropdown" v-model="searchType">
        <option v-for="item in searchTypes" :value="item">
          {{item}}
        </option>
      </select>
      <div class="ui button" @click="createLocation">create</div>
    </div>
    <div class="results"></div>
  </div>
  <div class="ui search fluid">
    <div class="results"></div>
  </div>
  <div class="ui pointing label" v-if="city && province && country">
    Province: {{province}}, City: {{city}}
    <i class="delete icon" @click="deleteCity"></i>
  </div>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'
const CITY = "City";
const ADDRESS = "Address";
export default {
  data () {
    return {
      showlocation: {
        id: null,
        city: null,
        province: null,
        address: null,
        country: null,
      },
      country: null,
      province: null,
      city: null,
      locationSearch: null,
      searchType: ADDRESS,
      searchTypes: [ADDRESS, CITY],
    }
  },
  mounted() {
    this.trickyInit();
    if (this.locationed) {
      if (this.locationed.province) {
        this.province = this.locationed.province;
      }
      if (this.locationed.city) {
        this.city = this.locationed.city;
      }
      if (this.locationed.address) {
        this.locationSearch = this.locationed.address;
      }
      Object.assign(this.showlocation, this.locationed);
    }
  },
  methods: {
    trickyInit() {
      let vm = this;

      if (vm.searchType == CITY) {
        cityPut();
      } else if (vm.searchType == ADDRESS) {
        addressPut();
      } else {
        alert("something wrong")
      }

      $('.ui.category.search.treatlocation .ui.compact.selection.dropdown').dropdown({
        onChange: (value, text, $selectedItem) => {
          vm.searchType = value.trim();
          if (vm.searchType == CITY) {
            cityPut();
          } else if (vm.searchType == ADDRESS) {
            addressPut();
          } else {
            alert("something wrong")
          }
        }
      });

      function cityPut () {
        function putCitys (results) {
          $('.ui.category.search.treatlocation').search({
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
              vm.city = location.city;
              vm.province = location.province;
              vm.country = location.country;
            },
            minCharacters: 2,
            fields: {
              categoryName: 'province',
              title: 'city',
              name: 'province',
            },
            searchDelay: 480,
            type: 'category',
            cache: false,
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
      }

      function addressPut () {
        let locationsSearchApi = vm.$http.options.root+'/locations/search';
        $('.ui.category.search.treatlocation').search({
          apiSettings : {
            url: locationsSearchApi+'?address={query}',
            method:"GET",
            beforeSend (settings) {
              let params = {
                country: vm.country,
                city: vm.city,
                province: vm.province,
                lastime: utils.dateFormat(new Date()),
              }
              utils.useToken(params);
              settings.data = params;
              return settings;
            },
            onResponse (res) {
              if (res.meta && res.meta.status=="ok"
                && res.meta.code==200 && res.result
                && res.result.locations && res.result.locations.length) {

                let results = {}
                res.result.locations.forEach((e, i, a) => {
                  if (e.province && !results[e.province]) {
                    results[e.province] = {province: e.province,results: []}
                  }
                  results[e.province].results.push(e);
                })
                if (Object.keys(results).length) {
                  return {results};
                }
              } else {
                console.log(res);
              }
            },
          },
          onSelect(location, response) {
            vm.locationed.id = location.id||location._id;
            vm.locationed.city = location.city;
            vm.locationed.province = location.province;
            vm.locationed.address = location.address;
            vm.locationed.country = location.country;

            vm.locationSearch = location.address;

            vm.showlocation.id = location.id||location._id;
            vm.showlocation.city = location.city;
            vm.showlocation.province = location.province;
            vm.showlocation.address = location.address;
            vm.showlocation.country = location.country;
          },
          minCharacters: 2,
          fields: {
            categoryName: 'province',
            title: 'city',
            name: 'province',
            description: 'address',
          },
          searchDelay: 480,
          type: 'category',
        });
      }
    },
    createLocation() {
      if (!this.city || !this.province) {
        alert("city not selected");
        return;
      }

      if (!this.locationSearch || this.locationSearch.length <= 4) {
        alert("address is invalid");
        return;
      }

      if (this.locationed && this.locationed.address == this.locationSearch) {
        alert("address already exists");
        return
      }

      let params = {};
      utils.useToken(params);
      let body = {
        province: this.province,
        city: this.city,
        country: this.country,
        address: this.locationSearch,
      }
      if (!this.validLocation(body)) {
        return;
      }
      this.$http.post("location",body,{params}).then((res) => {
        if (utils.isResOk(res)) {
          let location = res.body.result.location;
          if (location) {
            this.locationed.id = location.id;
            this.locationed.country = location.country;
            this.locationed.city = location.city;
            this.locationed.province = location.province;
            this.locationed.address = location.address;

            this.showlocation.id = location.id;
            this.showlocation.city = location.city;
            this.showlocation.province = location.province;
            this.showlocation.address = location.address;
            this.showlocation.country = location.country;
          }
        }
      }).catch((err) => {
        console.log(err);
      });
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
    validLocation(location) {
      if (location) {
        let {province,city,address, country} = location;
        if (province) {
          if (province.length < 2 || province.length > 32) {
            alert("province length is unlegal");
            return;
          }
        }
        if (country) {
          if (country.length != 2) {
            alert("country length is unlegal");
            return;
          }
        }
        if (city) {
          if (city.length < 2 || city.length > 32) {
            alert("city length is unlegal");
            return;
          }
        }
        if (address) {
          if (address.length < 4 || address.length > 128) {
            alert("address length is unlegal");
            return;
          }
        }
        return true;;
      }
    },
    deleteSearch() {
      this.locationSearch = null;
    },
    deleteCity() {
      console.log('deleteCity');
      this.city = null;
      this.province = null;
      this.country = null;
    },
    deleteLocation() {
      console.log('deleteLocation');
      this.locationed.id = null;
      this.locationed.city = null;
      this.locationed.province = null;
      this.locationed.country = null;
      this.locationed.address = null;

      this.showlocation.id = null;
      this.showlocation.city = null;
      this.showlocation.province = null;
      this.showlocation.country = null;
      this.showlocation.address = null;
    },
  },
  props:['locationed'],
}
</script>

<style>
.ui.category.search.treatlocation .results{
  width: 20em;
}
.ui.category.search.treatlocation .results .category .result .content .title {
  text-align: left;
}
.ui.category.search.treatlocation .results .category .result .content .description {
  text-align: left;
}
</style>


<!-- <template>
<div>
  <select v-model="province" @change="onProvinceChange">
    <option :value="null"></option>
    <option v-for="location in commonLocations" :value="location.province">
      {{ location.province }}
    </option>
  </select>
  <span>Province: {{ province }}</span>
  <select v-model="city" @change="onCityChange">
    <option :value="null"></option>
    <option v-for="location in commonLocations" :value="location.city">
      {{ location.city }}
    </option>
  </select>
  <span>City: {{ city }}</span>
  <input type="text" v-model="address" @keyup="toSearch" placeholder="address search">
  <button @click="treatLocation">create</button>
  <ul>
    <li v-for="location in locations">
      <h5>{{location.city}}</h5>
      <h5>{{location.address}}</h5>
      <button @click="choiceLocation(location)">choose</button>
    </li>
  </ul>
</div>
</template>

<script>
import bus from 'bus'
import utils from 'utils'

export default {
  data () {
    return {
      locations:[],
      commonLocations:[],
      address:null,
      city:null,
      province:null,
    }
  },
  mounted() {
    this.commonLocations();
    if (this.locationed.province) {
      this.province = this.locationed.province;
    }
    if (this.locationed.city) {
      this.city = this.locationed.city;
    }
    if (this.locationed.address) {
      this.address = this.locationed.address;
    }
  },
  methods: {
    toSearch: utils.debounce(function () {
      if (this.address && this.address.length >= 2) {
        let params = {
          province: this.province,
          city: this.city,
          address: this.address,
          lastime: utils.dateFormat(new Date()),
        };
        utils.useToken(params);
        this.$http.get("locations/search",{params}).then((res) => {
          if (utils.isResOk(res)) {
            let locations = res.body.result.locations;
            this.locations = locations;
          }
        }).catch((err) => {
          console.log(err);
        });
      }
    }, 480),
    choiceLocation(location) {
      if (location && location.id) {
        this.locationed.id = location.id;
        // this.locationed.city = location.city;
        // this.locationed.province = location.province;
        // this.locationed.address = location.address;
        this.city = location.city;
        this.province = location.province;
        this.address = location.address;
      }
    },
    treatLocation() {
      if (this.city && this.province) {
        if (this.address && this.address.length > 4 && this.locations.length == 0) {
          let params = {};
          utils.useToken(params);
          let body = {
            province: this.province,
            city: this.city,
            address: this.address
          }
          if (!this.validLocation(body)) {
            return;
          }
          this.$http.post("location",body,{params}).then((res) => {
            if (utils.isResOk(res)) {
              let location = res.body.result.location;
              if (location) {
                this.locationed.id = location.id;
                // this.locationed.city = location.city;
                // this.locationed.province = location.province;
                // this.locationed.address = location.address;
                this.city = location.city;
                this.province = location.province;
                this.address = location.address;
              }
            }
          }).catch((err) => {
            console.log(err);
          });
        } else {
          alert("address is invalid");
        }
      } else {
        alert("city not selected");
      }
    },
    commonLocations(){
      let params = {
        lastime: utils.dateFormat(new Date()),
      };
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
    validLocation(location) {
      if (location) {
        let {province,city,address} = location;
        if (province) {
          if (province.length < 2 || province.length > 32) {
            alert("province length is unlegal");
            return;
          }
        }
        if (city) {
          if (city.length < 2 || city.length > 32) {
            alert("city length is unlegal");
            return;
          }
        }
        if (address) {
          if (address.length < 4 || address.length > 128) {
            alert("address length is unlegal");
            return;
          }
        }
        return true;;
      }
    },
    onCityChange() {
      console.log(this.citySelected);
      //级联选择
    },
    onProvinceChange() {
      console.log(this.provinceSelected);
      //级联选择
      //清空city
      //重新设置city可选集合
    },
  },
  props:['locationed'],
}
</script>

<style>
</style> -->
