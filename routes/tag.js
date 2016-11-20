const {Tag} = require('../models');
const {AppInfo, Codes} = require('../utils');

module.exports = class tag {
  constructor () {}

  //@route(post /tag)
  //#token()
  * newTag () {
    //新建标签
    let {parent, name, depict} = this.request.body;
    let tag = {
      creater: this.state.user.id,
      name,
      depict
    }
    let parentTag = yield Tag.findById(parent);
    if (parentTag) {
      tag.parent = parentTag.id;
    } else {
      this.body = AppInfo.Msg("parent not found", Codes.Tag.PARENT_FOUND);
      return;
    }
    tag = yield Tag.saveDoc(tag);
    this.body = AppInfo({tag});
  }

};
