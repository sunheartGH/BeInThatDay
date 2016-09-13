let parse = require('co-busboy'),
    fs = require('fs'),
    filetype = require('file-type'),
    cofs = require('co-fs'),
    path = require('path'),
    crypto = require('crypto'),
    AppInfo = require('../utils/AppInfo');

module.exports = function(config) {
  config = config||{};
  return function* (){
    if (('POST' != this.method) && (!this.request.is('multipart/*'))) return;
    let parts = parse(this);
    let part;
    let fields = {};
    while (part = yield parts) {
      if (part.length) {
        if(config.valid) {
          let ifvalid = config.valid(part[0], part[1]);
          if (!ifvalid) {
            this.body = AppInfo.ErrGen("field:"+ part[0] +" is invalid");
            return false;
          }
        }
        if (fields[part[0]]) {
          if (fields[part[0]] instanceof Array) {
            fields[part[0]].push(part[1]);
          } else {
            let fieldMulti = [];
            fieldMulti.push(fields[part[0]]);
            fieldMulti.push(part[1]);
            fields[part[0]] = fieldMulti;
          }
        } else {
          fields[part[0]] = part[1];
        }
      } else if (part.fieldname && !config.onlyfields) {
        let filetypeMime;
        if (part._readableState.buffer[0]) {
          filetypeMime = filetype(part._readableState.buffer[0]);
          if (filetypeMime) {
            part.mime = filetypeMime.mime;
            part.mimeType = filetypeMime.mime;
          } else {
            part.mime = null;
            part.mimeType = null;
          }
        }
        if(config.valid) {
          let ifvalid = config.valid(part.fieldname, {filename: part.filename, mime: part.mime});
          if (!ifvalid) {
            this.body = AppInfo.ErrGen("filename:"+ part.filename +" is invalid");
            return false;
          }
        }
        if (!part.filename) continue;
        let filepath = yield uploadPath(part.filename);
        if (!fields[part.fieldname]) {
          let stream = fs.createWriteStream(path.resolve(filepath));
          yield wrapPipe(part, stream);
          fields[part.fieldname] = {filename: part.filename, filepath: filepath.replace("public","").replace(/\\/g,"/")};
          //TODO 如果出错删除文件
          //console.log('uploading %s -> %s', part.filename, filepath);
        } else {
          this.body = AppInfo.ErrGen("file fieldname "+ part.fieldname +" is replicate");
          return false;
        }
      } else {
        continue;
      }
    }
    this.request.body = fields
    return true;
  }
}

function* uploadPath(filename) {
  let name = '';
  let buf = crypto.randomBytes(16);
  for (let i = 0; i < buf.length; ++i) {
    name += ('0' + buf[i].toString(16)).slice(-2);
  }
  let savePath = path.join('public/asset/image/', name.substr(0, 2));
  let ext = path.extname(filename);
  ext = ext.replace(/(\.[a-z0-9]+).*/i, '$1');
  name += ext;
  let exists = yield wrapExists(savePath);
  if(!exists){
    yield cofs.mkdir(savePath);
  }
  return path.join(savePath, name);
}

function wrapPipe (read, write) {
  return new Promise((resolve,reject)=>{
    read.pipe(write);
    write.on('finish',()=>{
      resolve();
    });
  });
}

function wrapExists(path) {
  return new Promise((resolve,reject)=>{
    fs.exists(path, (exists)=>{
      resolve(exists);
    });
  });
}
