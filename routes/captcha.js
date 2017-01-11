const {AppInfo, Codes, Captcha} = require('../utils');

module.exports = class captcha {
  constructor () {}

  //@route(get /captcha)
  * newCaptcha () {
    //生成新的验证码图片
    let cap = yield Captcha.drawBuffer();
    //将id与对应的 text 保存在 redis 中，五分钟有效期;
    Captcha.stowCaptcha({id: cap.id, text: cap.text.toLocaleLowerCase()});
    this.body = AppInfo({captcha: {img: cap.img, id: cap.id}});
  }
};
