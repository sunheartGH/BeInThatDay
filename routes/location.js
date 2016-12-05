const {Location} = require('../models');
const {AppInfo, Codes, Utils} = require('../utils');

module.exports = class location {
  constructor () {}

  //@route(post /location)
  //#token()
  * newLocation () {
    //新建位置
    let {longitude, latitude, country,
      state, province, city, address} = this.request.body;
    let location = yield Location.saveDoc({creater: this.state.user.id,longitude,latitude,
      country,state,province,city,address});

    this.body = AppInfo({location});
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
    location = yield Location.updateSetDoc(location.id, {longitude, latitude, country, state,
      province, city, address});

    this.body = AppInfo({location});
  }
};
