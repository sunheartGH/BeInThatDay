const {Location, User} = require('../models');
const fs = require('fs');
const {AppInfo, Codes, Utils, Constants} = require('../utils');
const co = require('co');

co(function* () {
  let citysFile = fs.readFileSync(__dirname+"/cn_citys", 'utf-8');
  let areas = citysFile.match(/[\u4E00-\u9FA5\uF900-\uFA2D]{2,}\s(\s{2}[\u4E00-\u9FA5\uF900-\uFA2D]{2,}\s)*/g);
  let user = yield User.findOne({username: 'admin'});
  for (let area of areas) {
    let pcs = area.split("\n");
    let p = pcs[0];
    let cs = pcs.slice(1, pcs.length);
    for (let c of cs) {
      let location = {
        type: Constants.LocationType.Common,
        country: "CN",
        province: p.trim(),
        city: c.trim(),
      };
      location.creater = user._id;
      let newLocation = new Location(location);
      location = yield newLocation.save();
      console.log(location);
    }
  }
}).catch((e) => {
  console.log(e);
})
