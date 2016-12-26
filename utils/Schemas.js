const Codes = require('./Codes');
const models = require('../models');
const AppInfo = require('./AppInfo.js');
const ObjectId = require('mongoose').Types.ObjectId;

function str2arr(str) {
  if (Object.prototype.toString.call(str) == "[object String]") {
    let arr = [];
    str.split(",").forEach((v, i) => {if (v) {arr[i] = v.trim()}});
    if (arr.length) {return arr;} else {return str}
  } else {
    return str;
  }
}

function NotNull(strs, model, chunk) {
  strs = str2arr(strs);
  if (typeof model == "string") {
    model = models[model];
  }
  for (let i in strs) {
    let key = strs[i].trim();
    if (chunk && !chunk[key] && chunk[key] !== 0) {
      let k = key.toUpperCase() + "_NULL";
      let code;
      if (Codes && model && Codes[model.modelName] && Codes[model.modelName][k]) {
        code = Codes[model.modelName][k];
      }
      return AppInfo.Msg(key + " can't be null", code);
    }
  }
}

exports.NotNullToMsg = NotNull;

function ValidType(strs, model, chunk) {
  strs = str2arr(strs);
  if (typeof model == "string") {
    model = models[model];
  }
  let notNullRes = NotNull(strs, model, chunk);
  if (notNullRes) {
    return notNullRes;
  } else {
    for (let i in strs) {
      let key = strs[i].trim();
      let k = key.toUpperCase() + "_TYPE";
      let code;
      if (Codes && model && Codes[model.modelName] && Codes[model.modelName][k]) {
        code = Codes[model.modelName][k];
      }
      let value = chunk[key];
      if (value) {
        if (model && model.schema && model.schema.path(key)) {
          let instance = model.schema.path(key).instance;
          let vt;
          switch (instance) {
            case "String":
              if (typeof value != "string") vt = "String";
            break;
            case "Number":
              if (isNaN(value)) vt = "Number";
            break;
            case "Boolean":
            case "Bool":
              if (value.toString() != "true" && value.toString() != "false")
                vt = "Boolean";
            break;
            case "DocumentArray":
            case "Array":
              if (! Array.isArray(value)) vt = "Array";
            break;
            case "Date":
              if (new Date(value) == "Invalid Date") vt = "Date";
            break;
            case "Buffer":
              if (!Buffer.isBuffer(value)) vt = "Buffer";
            break;
            case "ObjectId":
            case "ObjectID":
            case "Oid":
              if (!ObjectIdValid(value)) vt = "ObjectId";
            break;
            case "Mixed":
            case "Embedded":
            case "Object":
              if (Object.prototype.toString.call(value) != "[object Object]")
                vt = "Object";
            break;
          }
          if (vt) {
            return AppInfo.Msg(key + " should be type: " + vt, code);
          }
        }
      }
    }
  }
}

exports.ValidTypeToMsg = ValidType;

function ObjectIdValid(value) {
  if (value && /^[0-9a-fA-F]{24}$/.test(value) && ObjectId.isValid(value)) {
    return true;
  }
}

exports.ObjectIdValid = ObjectIdValid;
