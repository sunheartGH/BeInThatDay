let userServe = require('../serves').user;

module.exports = class user {
  constructor () {}

  //@route(post /user)
  * registerUser (next) {
    //用户注册，验证是否已注册，验证用户名，邮箱，密码是否合法，密码加salt，密码md5/sha1/sha256加密
    //注册成功进行登陆
    //防止路由冲突和用户控制，用户名要过滤，不能为user/users,sub/subs,public/publics,act/acts,comment/comments等等
    //传递{}json格式，请求头要带 Content-Type: application/json 才能解析出json数据
    let {nickname,username,password,sex,email} = this.request.body;
    if (nickname && username && password && sex && email) {
      let result = yield userServe.addUser;
      if (result) {
        this.body = "register user successed!";
      } else {
        this.body = "register user failed!"
      }
    } else {
      this.body = "wrong body! please check nickname/name/password/email.";
    }
  }

  * userVerify () {
    //用户登陆时验证方法，验证登陆参数，用户名/邮箱，密码(做处理)是否合法，是否有效
    let {username,password} = this.request.body;
    if (username && password) {
      let result = yield userServe.findByUnPw;
      if (result) {
        return {valid: true, result: result["_id"]};
      } else {
        return {valid: false, result: "username or password is wrong"};
      }
    } else {
      return {valid: false, result: "username or password is none"};
    }
  }

  //@route(put /user/:id)
  * updateUserInfo () {
    //更新用户信息，修改用户昵称，头像， 标签，描述，主页等
  }

  //@route(put /user/:id/name)
  * updateUserName () {
    //更新用户信息，修改用户名
  }

  //@route(put /user/:id/email)
  * updateUserEmail () {
    //更新用户信息，修改用户邮箱
  }

  //@route(put /user/:id/pass)
  * updateUserPass () {
    //更新用户信息，修改用户密码
  }

  //@route(put /user/follow/:fid)
  * userFollowUser () {
    //更新用户信息，uid用户关注fid用户，收藏某sub
  }

  //@route(get /user/:id)
  * queryById () {
    //获取id用户的信息
  }

  //@route(delete /user/:id)
  * deleteUser () {
    //删除id用户的信息 注销
  }
};
