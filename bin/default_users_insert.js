const {User} = require('../models');
const {AppInfo, Codes, Utils, Constants, Cryptos} = require('../utils');
const co = require('co');
co(function* () {
  let account= {
    nickname: 'admin',
    username: 'admin',
    email: null,
    phone: null,
  };
  let password = '^0admin9$';
  let user = yield User.findByAccount(account); //验证用户是否重复
  if (user) {
    console.log("account is repeat", JSON.stringify(user));
  } else {
    let user = yield User.saveDoc(account);
    let enpw = Cryptos.encryptPw(password, user.id); //加密密码
    user = yield User.updateSetDoc(user.id, {password: enpw},{new: true}); //更新密码
    console.log(JSON.stringify(user));
  }
}).catch((e) => {
  console.log(e);
})
