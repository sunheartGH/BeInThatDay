const {Location, User, Activity} = require('../models');
const {AppInfo, Codes, Schemas, Utils} = require('../utils');

module.exports = class tag {
  constructor () {}

  * newLocation (next) {
    //参数格式判断
    let {longitude, latitude, country,
      state, province, city, address} = this.request.body;
    let validMsg = Schemas.ValidTypeToMsg(`country, province, city, address`, Location, this.request.body);
    if (validMsg) {
      this.body = validMsg;
      return;
    }
    if (province.length < 2 || province.length > 32) {
      this.body = AppInfo.Msg("province length is unlegal", Codes.Location.PROVINCE_DATA);
      return;
    }
    if (city.length < 2 || city.length > 32) {
      this.body = AppInfo.Msg("country length is unlegal", Codes.Location.CITY_DATA);
      return;
    }
    if (address.length < 4 || address.length > 128) {
      this.body = AppInfo.Msg("address length is unlegal", Codes.Location.ADDRESS_DATA);
      return;
    }
    if (country) {
      let validMsg = Schemas.ValidTypeToMsg(`country`, Location, this.request.body);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (country.length != 2) {
        this.body = AppInfo.Msg("country length is unlegal", Codes.Location.COUNTRY_DATA);
        return;
      }
    }
    if (state) {
      let validMsg = Schemas.ValidTypeToMsg(`state`, Location, this.request.body);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (state.length < 2 || state.length > 32) {
        this.body = AppInfo.Msg("state length is unlegal", Codes.Location.STATE_DATA);
        return;
      }
    }

    if (longitude) {
      let validMsg = Schemas.ValidTypeToMsg(`longitude`, Location, this.request.body);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (longitude < -180 || longitude > 180) {
        this.body = AppInfo.Msg("longitude is unlegal", Codes.Location.LONGITUDE_DATA);
        return;
      }
    }

    if (latitude) {
      let validMsg = Schemas.ValidTypeToMsg(`latitude`, Location, this.request.body);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (latitude < -90 || latitude > 90) {
        this.body = AppInfo.Msg("latitude is unlegal", Codes.Location.LATITUDE_DATA);
        return;
      }
    }

    yield next;
  }

  * modifyLocation (next) {
    let validMsg = Schemas.ValidTypeToMsg(`province, city, address`, Location, this.request.body);
    if (validMsg) {
      this.body = validMsg;
      return;
    }
    if (province.length < 2 || province.length > 32) {
      this.body = AppInfo.Msg("province length is unlegal", Codes.Location.PROVINCE_DATA);
      return;
    }
    if (city.length < 2 || city.length > 32) {
      this.body = AppInfo.Msg("country length is unlegal", Codes.Location.CITY_DATA);
      return;
    }
    if (address.length < 4 || address.length > 128) {
      this.body = AppInfo.Msg("address length is unlegal", Codes.Location.ADDRESS_DATA);
      return;
    }
    if (country) {
      let validMsg = Schemas.ValidTypeToMsg(`country`, Location, this.request.body);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (country.length < 2 || country.length > 32) {
        this.body = AppInfo.Msg("country length is unlegal", Codes.Location.COUNTRY_DATA);
        return;
      }
    }
    if (state) {
      let validMsg = Schemas.ValidTypeToMsg(`state`, Location, this.request.body);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (state.length < 2 || state.length > 32) {
        this.body = AppInfo.Msg("state length is unlegal", Codes.Location.STATE_DATA);
        return;
      }
    }

    if (longitude) {
      let validMsg = Schemas.ValidTypeToMsg(`longitude`, Location, this.request.body);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (longitude < -180 || longitude > 180) {
        this.body = AppInfo.Msg("longitude is unlegal", Codes.Location.LONGITUDE_DATA);
        return;
      }
    }

    if (latitude) {
      let validMsg = Schemas.ValidTypeToMsg(`latitude`, Location, this.request.body);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (latitude < -90 || latitude > 90) {
        this.body = AppInfo.Msg("latitude is unlegal", Codes.Location.LATITUDE_DATA);
        return;
      }
    }
    yield next;
  }

  * showCommonLocations (next) {
    //分页查询判断
    let validMsg = Utils.validPageTime(this.query);
    if (validMsg) {
      this.body = validMsg;
      return;
    }
    yield next
  }

  * searchLocations (next) {
    let {province, city, address, country} = this.query;
    let validMsg = Schemas.ValidTypeToMsg(`address`, Location, this.query);
    if (validMsg) {
      this.body = validMsg;
      return;
    }
    if (address.length < 2 || address.length > 128) {
      this.body = AppInfo.Msg("address length is unlegal", Codes.Location.ADDRESS_DATA);
      return;
    }
    if (province) {
      let validMsg = Schemas.ValidTypeToMsg(`province`, Location, this.query);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (province.length < 2 || province.length > 32) {
        this.body = AppInfo.Msg("province length is unlegal", Codes.Location.PROVINCE_DATA);
        return;
      }
    }
    if (city) {
      let validMsg = Schemas.ValidTypeToMsg(`city`, Location, this.query);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (city.length < 2 || city.length > 32) {
        this.body = AppInfo.Msg("country length is unlegal", Codes.Location.CITY_DATA);
        return;
      }
    }
    if (country) {
      let validMsg = Schemas.ValidTypeToMsg(`country`, Location, this.request.body);
      if (validMsg) {
        this.body = validMsg;
        return;
      }
      if (country.length != 2) {
        this.body = AppInfo.Msg("country length is unlegal", Codes.Location.COUNTRY_DATA);
        return;
      }
    }
    //分页查询判断
    validMsg = Utils.validPageTime(this.query);
    if (validMsg) {
      this.body = validMsg;
      return;
    }
    yield next
  }
};
