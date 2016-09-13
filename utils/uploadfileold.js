let path = require('path'),
    fs = require('fs'),
    cofs = require('co-fs');

function pPipe (read, write) {
  return new Promise((resolve,reject)=>{
    read.pipe(write);
    write.on('finish',()=>{
      resolve();
    });
  });
}

function pExists(path) {
  return new Promise((resolve,reject)=>{
    fs.exists(path, (exists)=>{
      resolve(exists);
    });
  });
}

module.exports = function () {
  return function* (next) {
    if (this.request.method == 'POST') {
      let postBody = this.request.body;
      let files = postBody.files;
      for (let upName in files) {
        let file = files[upName];
        let upFilePath = file.path;
        let readable = fs.createReadStream(upFilePath);
        let upFileName = path.basename(upFilePath);
        let fileType = file.type;
        let suffix = "." + fileType.substring(fileType.indexOf('/')+1,fileType.length);
        let fileName = upFileName.replace('upload_', '') + suffix;
        let savePath = path.join(path.resolve('public/asset/image/'), fileName.substr(0, 2));
        let exists = yield pExists(savePath);
        if(!exists){
          yield cofs.mkdir(savePath);
        }
        let saveFile = path.join(savePath, fileName);
        let writable = fs.createWriteStream(saveFile);
        yield pPipe(readable, writable);
        let upExists = yield pExists(upFilePath);
        if(upExists){
          yield cofs.unlink(upFilePath);
        }
        postBody.fields[upName] = '/asset/image/' + fileName.substr(0, 2) + '/' + fileName;
      }
      postBody.files = {};
    }
    //TODO 如果出错删除文件
    yield next;
  };
}

// body = require('koa-body');
// app.use(body({
//   multipart: true,
//   formidable: {uploadDir: path.join(__dirname, '/temp')}
// }));
// app.use(UploadFile());
