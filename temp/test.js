// let execute = Act.find({actday: {$gte: deDate, $lte: toDate}})
//               .select({_id: 1, title: 1, icon: 1, loved: 1, actday: 1})
//               .aggregate()
//               .group({actday: {$dayOfMonth: "$date"}})
//               .srot({loved: -1})
//               .limit(1);
// db.acts.find({actday: {$gte: new Date('2016-02-29'), $lte: new Date('2016-04-07')}}).aggregate().group({actday: {$dayOfMonth: "$date"}}).srot({loved: -1}).limit(1)
//
// db.acts.find({actday: {$gte: new Date('2016-02-29'), $lte: new Date('2016-04-07')}}).aggregate({key:{actday: 1}})
//
// var actsTmp = db.acts.find({'actday': {$gte: new Date('2016-02-29'), $lte: new Date('2016-04-07')}}).sort({actday: -1, loved: -1})
//
// db.acts.group({
//   key: {actday: 1, _id: 1},
//   cond: {actday: {$gte: new Date('2016-02-29'), $lte: new Date('2016-04-07')}},
//   reduce: function ( curr, result ) {
//     if(curr.loved > result.loved ){
//       result.loved = curr.loved;
//       result.id = curr._id;
//     }
//   },
//   initial: { }
// })
// {
//   var actdays = db.acts.aggregate([
//     {$match: {actday: {$gte: new Date('2016-02-29'), $lte: new Date('2016-04-07')}}},
//     {$group: {_id: '$actday' }}
//   ])
//   var ada = actdays.toArray()
//   var acts = []
//   for (var i in ada) {
//     var ad = ada[i]._id
//     var act = db.acts.find({_id: 1, title: 1, icon: 1, loved: 1, actday: {$eq: ad}}).sort({loved: -1}).limit(1)
//     for (var variable in act) {
//       print(variable)
//     }
//   }
// }
//
// acts.push(act)
//
//
//
// db.acts.aggregate([
// {$match: {"actday": {$gte: new Date('2016-02-29'), $lte: new Date('2016-03-12')}}},
// {$sort: {loved: 1}},
// {$group: {
//   _id: "$actday",
//   id: {$first: "$_id"},
//   title: {$first: "$title"},
//   icon: {$first: "$icon"},
//   loved: {$first: "$loved"}
// }},
// {$project: {
//     _id: "$id",
//     actday: "$_id",
//     title: "$title",
//     icon: "$icon",
//     loved: "$loved"
// }}
// ]).pretty()
//
// //$first:"$$ROOT"
//
// multiple="multiple"
//
// function randomStr(num) {
//   num = num <=0 ? 1 : num;
//   let arrayStr = new Array(num + 1).join(',');
//   return arrayStr.replace(/,/g, function () {
//     return (Math.random() * 16 | 0).toString(16);
//   });
// }
//
// -----------------------------------------
//
// var code = 'module.exports =  {\r\n\r\n  //@route(get /acts/:id)\r\n  queryOne: function* (next) {\r\n    \r\n  },\r\n\r\n  //@route(post|get /acts/page)\r\n  queryPage: function* (next) {\r\n\r\n  }\r\n\r\n}\r\n'
//
// var reg = /\/\/.*@route\(.*\)\r\n.*[^\/]\(.*\)/g;
//
// while(true) {
//   var math = reg.exec(code);
//   if (!math) {
//     break;
//   }
//   console.log(math);
// }


// var restr = 'dfdfd (next)'.replace(/function|module|exports|=|\.|:|\s|\*/g,"");
// console.log('sdfssd(next)'.match(/[a-zA-Z0-9_\$]+[^\s\(\)]/));


// -----------------------------------------
//测试 mongoose 某schema中某字段类型设置为其他schema，其在数据库中的存储方式
//字段类型定义为{type: Schema.ObjectId, ref='Some'}和字段类型直接定义为SomeSchema的区别
//上面类型保存时， 值直接使用some._id是否能保持成功和其保存形式
// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
//
// var UserSchema = new mongoose.Schema({
//   name: String,
//   tags: Array //数组类型，不赋值会创建字段，并赋值0长数组
// });
//
// var ItemSchema = new mongoose.Schema({
//   title: String
// });
// var UserModel = mongoose.model('User', UserSchema, 'User');
// mongoose.connect("mongodb://127.0.0.1:27017/test", (err) => {
//   if (err) {
//     console.error('connect to %s error: ', "test", err.message);
//     process.exit(1);
//   }
//   console.log(UserModel.modelName);
//   // UserModel.schema.eachPath(function(path) {
//   //   console.log(UserModel.schema.path("dddd"));
//   //
//   //   console.log(UserModel.schema.path(path).instance);
//   // });
// });

// String
// Number
// Boolean
// DocumentArray
// Embedded
// Array
// Buffer
// Date
// ObjectId
// Mixed
// Oid
// Object
// Bool


// var PostSchema = new mongoose.Schema({
//   creater: {type: Schema.ObjectId, ref: "User"}, //保证值为对象id,不会是一个对象,string不会赋值成功
//   post: String,
//   items: [{type:Schema.ObjectId, ref: "Item"}]
//   //creater: {type: Schema.ObjectId, ref: "User"} 保证值为id,不会是一个对象,string类型等不可赋值，此shema实例对象和其他schema实例对象的类型都可以赋值
//   //items: [String] 数组字面量，不赋值会创建字段，并赋值0长数组。
//   //item: ItemSchema 无法限制类型，string和此shema实例对象和其他schema实例对象的类型都可以赋值，导致值不确定,值为一个包含id的对象
//   //items: [ItemSchema] 无法限制类型，类型转换，string类型等不可赋值，此shema实例对象和其他schema实例对象的类型都可以赋值，无法保证数组元素类型一致，导致值不确定，值为一个包含id的对象
//   //items: [{type:Schema.ObjectId, ref: "Item"}] 保证数组元素值为id,不会是一个对象,string类型等不可赋值，此shema实例对象和其他schema实例对象的类型都可以赋值
// });



// var userModel = mongoose.model("User", UserSchema, 'user');
// var postModel = mongoose.model("Post", PostSchema, 'post');
// var itemModel = mongoose.model("Item", ItemSchema, 'item');
//
// var user = new userModel({name:"The name"});
// user.save(function(err, obj){
//   var item1 = new itemModel({title:"the title 1"});
//   var item2 = new itemModel({title:"the title 2"});
//   item1.save(function (err, item1Obj) {
//     item2.save(function (err, item2Obj) {
//       var post = new postModel({creater: obj, post: "The Post", items:[item1Obj, item2Obj]}); //赋值可以赋值对象或对象id
//       post.save(function(err, obj) {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log("saved ok");
//         }
//       });
//     })
//   })
// });


// function str2arr(str) {
//   if (Object.prototype.toString.call(str) == "[object String]") {
//     let arr = [];
//     str.split(",").forEach((v, i) => {arr[i] = v.trim()});
//     if (arr.length) {return arr;} else {return str}
//   } else {
//     return str;
//   }
// }
// console.log(str2arr(`creater, title, cover_picurl, content,
//   site, start_time, end_time`));

// var ObjectId = require('mongoose').Types.ObjectId;
// console.log(ObjectId.isValid('57c2f6c9dc335bd45c87a80c'));

// const Cryptos = require('../utils/Cryptos.js');
// console.log(Cryptos.buildToken('57c2f6c9dc335bd45c87a80c'));
// console.log(Cryptos.parseToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJiZWludGhhdGRheSIsImV4cCI6MTQ4MjE1OTcxNCwiaWF0IjoxNDc5NTY3NzE0LCJhdWQiOiI1ODMwNjk2MjBkZTg0NDljMzcwNTFjNjYifQ==.Kf0plkqS7p+rHW8KdbkWUpaUxSSCUZhN3f4Uf4KBXy8='));
// console.log(Cryptos.encryptPw("123123", '57c2f6c9dc335bd45c87a80c'));
// const moment = require('moment');
// console.log(moment().add(1, 'months').toDate().getTime()/1000 | 0)
// console.log(moment().toDate().getTime());
// console.log(moment().toDate().getTime()/1000 | 0);

function selectInDoc (doc, select){
  if (doc && toString.call(doc) == "[object Object]" && select) {
    select = flatten(select);
    for (let key in select) {
      if (key.indexOf(".") > 0) {
        _walkStart(doc, select, key);
      } else {
        if (!select[key]) {
          delete doc[key];
        }
      }
    }
  }
};

function selectInDocs (docs, select){
  if (docs && toString.call(docs) == "[object Array]" && docs.length && select) {
    select = flatten(select);
    for (let doc of docs) {
      for (let key in select) {
        if (key.indexOf(".") > 0) {
          _walkStart(doc, select, key);
        } else {
          if (!select[key]) {
            delete doc[key];
          }
        }
      }
    }
  }
};

function _walkStart(doc, select, key) {
  let ks = key.split(".");
  let i = 0;
  function walk (obj, ck) {
    if (toString.call(obj) == "[object Object]") {
      if (i == ks.length - 1 && obj && ck && !select[key]) {
        delete obj[ck];
      } else {
        i++;
        walk(obj[ck], ks[i]);
      }
    } else if (toString.call(obj) == "[object Array]") {
      if (!isNaN(ck) && obj[ck] && !select[key]) {
        delete obj[ck];
      } else {
        for (let o of obj) {
          walk(o, ks[i]);
        }
      }
    }
  }
  walk(doc, ks[i]);
}

function flatten (data) {
  let result = {};
  function recurse (cur, prop) {
    if (Object(cur) !== cur) {
      result[prop] = cur;
    } else if (Array.isArray(cur)) {
      for(let i=0, l=cur.length; i<l; i++){
        recurse(cur[i], prop + "[" + i + "]");
      }
      if (l == 0) result[prop] = [];
    } else {
      let isEmpty = true;
      for (let p in cur) {
        isEmpty = false;
        recurse(cur[p], prop ? prop+"."+p : p);
      }
      if (isEmpty && prop) result[prop] = {};
    }
  }
  recurse(data, "");
  return result;
}

let a = {
  name: "jon",
  sex: "w",
  info: {
    favor: "book",
    habbit: "sport"
  }
}

let b = [{
  name: "nami",
  sex: "m",
  info: {
    favor: "fruit",
    habbit: "cake"
  }
},{
  name: "fench",
  sex: "w",
  info: {
    favor: "machine",
    habbit: "code"
  }
}]

let s = {
  sex: 0,
  "info": {
    favor: 0
  }
}
console.log(JSON.stringify(a));
console.log(JSON.stringify(b));
selectInDoc(a, s);
selectInDocs(b, s);
console.log("------");
console.log(JSON.stringify(a));
console.log(JSON.stringify(b));
