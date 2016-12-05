const {Tag} = require('../models');
const {AppInfo, Codes} = require('../utils');

module.exports = class tag {
  constructor () {}

  * newTag (next) {
    //参数格式判断
    let {parent, name, depict} = this.request.body;
    let validMsg = Schemas.ValidTypeToMsg(`
      parent, name, depict`,
      Tag, this.request.body);

    if (validMsg) {
      this.body = validMsg;
      return;
    }
    if (depict.length < 2 || depict.length > 128) {
      this.body = AppInfo.Msg("depict length is unlegal", Codes.Tag.DEPICT_DATA);
      return;
    }
    yield next;
  }

};
