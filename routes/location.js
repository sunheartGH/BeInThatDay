const {Location} = require('../models');
const {AppInfo, Codes, Utils, Constants} = require('../utils');

const fs = require('fs');

module.exports = class location {
  constructor () {}

  //@route(post /location)
  //#token()
  * newLocation () {
    //新建位置
    let {longitude, latitude, country,
      state, province, city, address} = this.request.body;

    country = country || "CN";
    let commonLocations = yield Location.find({country, state, province, city, type: Constants.LocationType.Common});
    let matchAddress = yield Location.find({address: {$regex: address, $options:"g"}});
    if (matchAddress && matchAddress.length) {
      this.body = AppInfo.Msg("address is repeat", Codes.Comment.REPEAT_WRONG);
      return;
    }
    if (commonLocations && commonLocations.length) {
      let location = yield Location.saveDoc({creater: this.state.user.id,longitude,latitude,
        country,state,province,city,address});

      this.body = AppInfo({location});
    } else {
      this.body = AppInfo.Msg("wrong location province or city", Codes.Location.CITY_FOUND);
    }
  }

  //@route(put /location/:id)
  //#token()
  * modifyLocation () {
    //修改位置数据
    let {id} = this.params;
    //权限判断
    let location = yield Location.findById(id, {creater: this.state.user.id});
    if (!location) {
      this.body = AppInfo.Msg("location modify not allowed", Codes.Common.PERMISSION_FORBID);
      return;
    }
    let {longitude, latitude, country,
      state, province, city, address} = this.request.body;

    let commonLocations = yield Location.find({country, state, province, city, type: Constants.LocationType.Common});
    let matchAddress = yield Location.find({address: {$regex: address, $options:"g"}});
    if (matchAddress && matchAddress.length) {
      this.body = AppInfo.Msg("address is repeat", Codes.Location.ADDRESS_FOUND);
      return;
    }
    if (commonLocations && commonLocations.length) {
      location = yield Location.updateSetDoc(location.id, {longitude, latitude, country, state,
        province, city, address});

      this.body = AppInfo({location});
    } else {
      this.body = AppInfo.Msg("wrong location province or city", Codes.Location.CITY_FOUND);
    }
  }

  //@route(get /locations/common)
  //#iftoken()
  * showCommonLocations () {
    let pageObj = Utils.parsePageTime(this.query);
    let locations;
    if (Utils.havePageTime(this.query)) {
      locations = yield Location.findByPage(pageObj, {type: Constants.LocationType.Common}, {country:1,province:1,city:1});
    } else {
      locations = yield Location.find({type: Constants.LocationType.Common}, {country:1,province:1,city:1});
    }

    let page = pageObj.page;
    let size = 0;
    if (locations && locations.length) {
      size = locations.length;
    } else {
      locations = [];
    }
    this.body = AppInfo({page, size, locations});
  }

  //@route(get /locations/search)
  //#token()
  * searchLocations () {
    //在某类型下根据(父类和)名称搜索标签
    let {province, city, address, country} = this.query;
    let pageObj = Utils.parsePageTime(this.query);
    let locations = yield Location.findByPage(
      pageObj,
      {address: {$regex: address, $options:"g"}, province, city, country},
      {country:1,province:1,city:1,address:1}
    );

    let page = pageObj.page;
    let size = 0;
    if (locations && locations.length) {
      size = locations.length;
    } else {
      locations = [];
    }
    this.body = AppInfo({page, size, locations});
  }
};
