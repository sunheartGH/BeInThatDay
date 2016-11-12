
module.exports = class captcha {
  constructor () {}

  //@route(get /captcha)
  * newCaptcha () {
    //生成新的验证码图片
    this.body = "captcha";
  }
};
