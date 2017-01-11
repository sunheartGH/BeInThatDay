exports.usernameRgx = /^[a-zA-Z0-9.-_$@*#&]{2,32}$/;
exports.nicknameRgx = /^[a-zA-Z0-9.-_$@*#&\u4e00-\u9fa5]{2,32}$/;
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
  Followed: "Followed",   //被关注
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
exports.LocationType = {
  Normal: "Normal",
  Common: "Common",
}
exports.MessageType = {
  Notice: "Notice",
}
exports.MessageState = {
  Unread: "Unread",
  Readed: "Readed",
}
exports.MessageContentType = {
  SubjectFavorite: "SubjectFavorite",
  UnderComment: "UnderComment",
  ReplyComment: "ReplyComment",
  FriendRelationApply: "FriendRelationApply", //好友申请
  FriendRelationAccept: "FriendRelationAccept", //好友同意
  FollowRelation: "FollowRelation",
}
exports.MessageTitle = {
  SubjectFavorite: "新的收藏动态",
  UnderComment: "新的评论动态",
  ReplyComment: "新的评论回复动态",
  FriendRelationApply: "新的好友申请动态",
  FriendRelationAccept: "新的好友动态",
  FollowRelation: "新的关注动态",
}
exports.MessageContent = {
  SubjectFavorite: "#sender#收藏了你的: #title#",
  UnderComment: "#sender#评论了你的: #title#, 评论内容: #content#",
  ReplyComment: "#sender#在#title#下回复了你的#comment#评论, 评论内容: #content#",
  FriendRelationApply: "#sender#申请添加你为好友",
  FriendRelationAccept: "#sender#同意了你的好友申请",
  FollowRelation: "#sender#关注了你",
}
