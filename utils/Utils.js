const AppInfo = require('./AppInfo.js');
const Codes = require('./Codes');
const validator = require('validator');

exports.validPageTime = function (body) {
  if (body) {
    let {page, size, lastime, firstime} = body;
    if (page && (isNaN(page) || page < 0 || page%1 > 0)) {
      return AppInfo.Msg("page should be positive integer", Codes.Common.PAGETIME_PAGE_WRONG);
    }
    if (size && (isNaN(size) || size < 0 || size%1 > 0)) {
      return AppInfo.Msg("size should be positive integer", Codes.Common.PAGETIME_SIZE_WRONG);
    }
    if (lastime && !validator.isDate(lastime)) {
      return AppInfo.Msg("lastime should be date", Codes.Common.PAGETIME_LASTIME_WRONG);
    }
    if (firstime && !validator.isDate(firstime)) {
      return AppInfo.Msg("firstime should be date", Codes.Common.PAGETIME_FIRSTIME_WRONG);
    }
  }
};

exports.parsePageTime = function (body) {
  if (body) {
    let {page, size, lastime, firstime} = body;
    page = Number(page) || 1;
    if (size) {
      size = size > 20 ? 20 : Number(size);
    } else {
      size = 10;
    }
    if (lastime) {
      lastime = new Date(lastime);
    } else {
      lastime = new Date();
    }
    if (firstime) {
      firstime = new Date(firstime);
    }
    return {page: page, size: size, offset: (page - 1)*size, lastime: lastime, firstime: firstime}
  }
};
