https:#cnodejs.org/topic/56936889c2289f51658f0926

https:#segmentfault.com/a/1190000004465603

node --harmony_destructuring --use_strict app.js

forever start -wc "node --harmony_destructuring --use_strict" app.js

热部署/服务监控库：node-dev<supervisor<nodemon<forever<pm2



---

design：

1.默认显示主用户的日历数据，每个用户默认关注主用户，不能取消关注，主用户具有的权限是能显示所

   有（所有用户创建的日历数据）公开日历数据。

2.每个用户都有日历数据页，显示其公开/私有的日历数据（创建或收藏的日历数据），显示方式为标题或

   图片

3.用户可以查看，收藏关注者/其他用户的公开日历数据，用户可以创建日历数据，可以被其他人关注和收

   藏日历数据

4.日历数据显示收藏数（来源）和赞数（本次收藏中的），有标题，内容，标签，创建者，创建时间，活

​    动时间，活动描述，显示图片，链接，日历数据有评论（热度排名型）

5.离线用户可以查看之前收藏后存在本地的数据(web/app)
