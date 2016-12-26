const {Tag, User, Activity} = require('../models');
const {AppInfo, Codes, Schemas, Utils} = require('../utils');

module.exports = class tag {
  constructor () {}

  * newTag (next) {
    //参数格式判断
    let {parent, name} = this.request.body;
    let validMsg = Schemas.ValidTypeToMsg(`name`, Tag, this.request.body);
    if (validMsg) {
      this.body = validMsg;
      return;
    }
    if (name.length < 2 || name.length > 64) {
      this.body = AppInfo.Msg("tag name length is unlegal", Codes.Tag.NAME_DATA);
      return;
    }
    if (parent) {
      if (!Schemas.ObjectIdValid(parent)) {
        this.body = AppInfo.Msg("tag parent must be objectid string", Codes.Tag.PARENT_DATA);
        return;
      }
    }
    yield next;
  }

  * tagTarget (next) {
    let {target_id, target_type, tag_id, auth_field} = this.request.body;
    if (target_id) {
      if (typeof target_id != "string") {
        this.body = AppInfo.Msg("target_id must be string", Codes.Common.PARAM_TYPE);
        return;
      }
      if (!Schemas.ObjectIdValid(target_id)) {
        this.body = AppInfo.Msg("target_id must be objectid string", Common.PARAM_DATA);
        return;
      }
    } else {
      this.body = AppInfo.Msg("target_id can't be null", Codes.Common.PARAM_NULL);
      return;
    }

    if (target_type) {
      if (typeof target_type != "string") {
        this.body = AppInfo.Msg("target_type must be string", Codes.Common.PARAM_TYPE);
        return;
      }
      if (![User.modelName,Activity.modelName].includes(target_type)) {
        this.body = AppInfo.Msg("target_type is illegal", Codes.Common.PARAM_DATA);
        return;
      }
    } else {
      this.body = AppInfo.Msg("target_type can't be null", Codes.Common.PARAM_NULL);
      return;
    }

    if (tag_id) {
      if (typeof tag_id != "string") {
        this.body = AppInfo.Msg("tag_id must be string", Codes.Common.PARAM_TYPE);
        return;
      }
      if (!Schemas.ObjectIdValid(tag_id)) {
        this.body = AppInfo.Msg("tag_id must be objectid string", Codes.Common.PARAM_DATA);
        return;
      }
    } else {
      this.body = AppInfo.Msg("tag_id can't be null", Codes.Common.PARAM_NULL);
      return;
    }

    if (auth_field) {
      if (typeof auth_field != "string") {
        this.body = AppInfo.Msg("auth_field must be string", Codes.Common.PARAM_TYPE);
        return;
      }
      if (auth_field.length > 64) {
        this.body = AppInfo.Msg("auth_field length is illegal", Codes.Common.PARAM_DATA);
        return;
      }
    } else {
      this.body = AppInfo.Msg("auth_field can't be null", Codes.Common.PARAM_NULL);
      return;
    }

    yield next;
  }

  * searchTags (next) {
    let {name, parent} = this.query;
    let validMsg = Schemas.ValidTypeToMsg(`name`, Tag, this.query);
    if (validMsg) {
      this.body = validMsg;
      return;
    }
    if (name.length < 2 || name.length > 64) {
      this.body = AppInfo.Msg("tag name length is unlegal", Codes.Tag.NAME_DATA);
      return;
    }
    if (parent) {
      if (!Schemas.ObjectIdValid(parent)) {
        this.body = AppInfo.Msg("tag parent must be objectid string", Codes.Tag.PARENT_DATA);
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
