const {Location} = require('../models');
const {AppInfo, Codes} = require('../utils');

module.exports = class location {
  constructor () {}

  //@route(post /location)
  //#token()
  * newLocation () {
    //新建地点
    let {longitude, latitude, country,
      state, province, city, address} = this.request.body;
    let location = {
      creater: this.state.user.id,
      longitude,
      latitude,
      country,
      state,
      province,
      city,
      address
    }
    location = yield Location.saveDoc(location);
    this.body = AppInfo({location});
  }
};
