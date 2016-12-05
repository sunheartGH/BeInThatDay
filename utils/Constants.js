exports.usernameRgx = /^[a-zA-Z0-9.-_$@*#&]{3,30}$/;
exports.passwordRgx = /^[a-zA-Z0-9.\-_$@*!/+=~#%<>:;"'&^()|]{6,36}$/;
exports.sensitiveChars = [
  "public","publics","username","name","admin","root","beinthatday"
];
exports.ExposeLevel = {
  Public: "Public",       //公开
  Coterie: "Coterie",     //圈子
  Friend: "Friend",       //好友
  Private: "Private",     //私有
}
exports.RelateType = {
  Follow: "Follow",       //关注
  Friend: "Friend",       //好友
}
exports.RelateState = {
  Unilateral: "Unilateral",   //单方的
  Bilateral: "Bilateral",     //双方的
  Broken: "Broken",           //断开的
}
exports.CommentUnderType = {
  Subject: "Subject",
}
exports.UserGender = {
  woman: "woman",
  man: "man",
}
exports.UserPopulateSelect = "id username nickname avatar";
