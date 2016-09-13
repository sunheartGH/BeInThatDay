// var util = require('util');
//
// function BaseError(msg, name) {
//   Error.captureStackTrace(this); //arguments.callee
//   this.message = msg;
//   this.name = name;
// }
// util.inherits(BaseError, Error);
//
// function WrongId(msg) {
//   BaseError.call(this, msg, 'WrongId');
// }

function ErrGen(msg) {
  return {error: 1, message: msg};
}

function MsgGen(msg) {
  return {error: 0, message: msg};
}

module.exports = {
  ErrGen: ErrGen,
  MsgGen: MsgGen,
  APPERROR: ErrGen('The App Occur Error'),
  NOFOUND: ErrGen('Nothing Found'),
  WRONGID: ErrGen('The Id Is Wrong')
}


// app.use(function* (next) {
//   try {
//     yield next;
//   } catch (e) {
//     console.log(e.stack);
//     this.body = AppInfo.APPERROR;
//   }
// });
