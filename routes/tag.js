const {Tag, User, Activity} = require('../models');
const {AppInfo, Codes, Utils} = require('../utils');

module.exports = class tag {
  constructor () {}

  //@route(post /tag)
  //#token()
  * newTag () {
    //新建标签
    let {parent, name} = this.request.body;
    let tag = {
      creater: this.state.user.id,
      name,
    }
    let results = yield Tag.find({name});
    if (results && results.length) {
      this.body = AppInfo.Msg("tag already exists", Codes.Common.REPEAT_WRONG);
      return;
    }
    if (parent) {
      let parentTag = yield Tag.findById(parent);
      if (parentTag) {
        tag.parent = parentTag.id;
      } else {
        this.body = AppInfo.Msg("parent not found", Codes.Tag.PARENT_FOUND);
        return;
      }
    }
    tag = yield Tag.saveDoc(tag);
    this.body = AppInfo({tag});
  }

  //@route(put /tag/target)
  //#token()
  * tagTarget () {
    //在某个对象标签集合里添加或移除一个标签
    let {target_id, target_type, tag_id, auth_field} = this.request.body;
    let tag = yield Tag.findById(tag_id);
    if (tag) {
      let target;
      if (target_type == User.modelName) {
        target = User;
      } else if (target_type == Activity.modelName) {
        target = Activity;
        let subject = yield Subject.findById(target_id);
        if (subject) {
          target_id = subject.refer_object.id;
        }
      }
      let targetDoc = yield target.findById(target_id, {[auth_field]: this.state.user.id, tags:{$exists: true}});
      let tags;
      if (targetDoc) {
        let doc;
        if (targetDoc.tags.includes(tag.id)) {
          doc = yield target.updatePullDoc(target_id, {tags: tag.id});
        } else {
          doc = yield target.updatePushDoc(target_id, {tags: tag.id});
        }
        tags = doc.tags;
        if (tags) {
          this.body = AppInfo({target_id, target_type, tag_id, auth_field, tags});
        } else {
          this.body = AppInfo.Msg("target tags operate wrong", Codes.Common.DB_FAIL);
        }
      } else {
        this.body = AppInfo.Msg("target tags operate wrong", Codes.Common.DB_FAIL);
      }
    } else {
      this.body = AppInfo.Msg("target data not found", Codes[target_type]._ID_FOUND);
    }
  }

  //@route(get /tags/search)
  //#token()
  * searchTags () {
    //在某类型下根据(父类和)名称搜索标签
    let {name, parent} = this.query;
    let pageObj = Utils.parsePageTime(this.query);
    let tags = yield Tag.findByPage(pageObj, {name: {$regex: name, $options:"g"}, parent});
    let page = pageObj.page;
    let size = 0;
    if (tags && tags.length) {
      size = tags.length;
    } else {
      tags = [];
    }
    this.body = AppInfo({page, size, tags});
  }
};
