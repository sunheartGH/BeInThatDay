const gm = require('gm').subClass({imageMagick: true});
const please = require('pleasejs');
const randomstring = require('randomstring');
const path = require('path');

class Captcha {
  constructor(options) {
    let opts = options || {};
    this.options = {
      width: opts.width || 86,
      height: opts.height || 38,
      background: opts.background || '#fff',
      textNoise: opts.textNoise || 'gaussian',
      text: opts.text || '',
      randomText: opts.randomText === false ? false : true,
      length: opts.length || 4,
      textX: opts.textX || 2,
      textY: opts.textY || 31,
      baseColor: opts.baseColor || '', // skyblue...
      font: opts.font || './font/Nunito-Light.ttf',
      fontSize: opts.fontSize || 32,
      wordWidth: opts.wordWidth || 19,
      maxSwirl: opts.maxSwirl || 20,
      lineCount: opts.lineCount || 5,
      lineWidth: opts.lineWidth || 1,
      dotCount: opts.dotCount || 200,
    };
    if (!this.options.text) {
      this.genText();
    }
  }

  genText() {
    this.options.text = randomstring.generate({
      length: this.options.length,
      charset: '23456789abcdefghkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
    });
  }

  draw() {
    this.gm = gm(this.options.width, this.options.height, this.options.background);
    this.drawText();
    this.drawDot();
    this.drawLine();
  }

  drawText() {
    if (this.options.randomText) this.genText();
    let color = please.make_color({
      base_color: this.options.baseColor,
      colors_returned: this.options.text.length
    });
    for (let i = 0; i < this.options.text.length; i++) {
      this.gm
      .stroke(color[i], 1)
      .fill(color[i])
      .font(path.join(__dirname, this.options.font))
      .fontSize(this.options.fontSize)
      .drawText(
        (this.options.wordWidth * i) + this.options.textX,
        this.options.textY,
        this.options.text[i]
      );
    }
    this.gm
    .wave(5, Math.floor(Math.random() * (100)) + 50)
    .noise(this.options.textNoise)
    .swirl(Math.floor(Math.random() * (this.options.maxSwirl)) + 1);
  }

  drawLine() {
    let color = please.make_color({
      base_color: this.options.baseColor,
      colors_returned: this.options.lineCount
    });
    for (let i = 0; i < this.options.lineCount; i++) {
      this.gm
      .stroke(color[i], this.options.lineWidth)
      .drawLine(
        Math.floor(Math.random() * (this.options.width)),
        Math.floor(Math.random() * (this.options.height)),
        Math.floor(Math.random() * (this.options.width)),
        Math.floor(Math.random() * (this.options.height))
      );
    }
  }

  drawDot() {
    let color = please.make_color({
      base_color: this.options.baseColor
    });
    this.gm.fill(color);
    for (let i = 0; i < this.options.dotCount; i++) {
      this.gm.drawPoint(
        Math.floor(Math.random() * (this.options.width)),
        Math.floor(Math.random() * (this.options.height))
      );
    }
  }

  toFile(filePath) {
    return new Promise((resolve, reject) => {
      if (!filePath) {
        reject('save path need!');
      }
      this.draw();
      this.gm.write(filePath, (err) => {
        if (err) {
          reject(err);
        }
        resolve(this.options.text);
      });
    });
  }

  toBuffer(type) {
    return new Promise((resolve, reject) => {
      let bufferType = type;
      if (!type) {
        bufferType = 'PNG';
      }
      this.draw();
      this.gm.toBuffer(bufferType, (err, buffer) => {
        if (err) {
          reject(err);
        }
        resolve({
          buffer,
          text: this.options.text
        });
      });
    });
  }
}

// module.exports = Captcha;
/*
Linux imagemagick 安装
1.  wget http://www.imagemagick.org/download/ImageMagick-7.0.4-3.tar.gz
2. tar xzvf ImageMagick-7.0.4-3.tar.gz
3. apt-get build-dep imagemagick
4. ./configure --prefix=/usr/local/imagemagick --enable-shared --with-freetype=yes --with-ttf=yes --with-png=yes --with-jpeg=yes --with-lcms=yes --with-fontconfig=yes
5. make && make install
确保依赖的库安装了，否则会产生 delegate library support not built-in 类似错误
或者：
1. apt-get install imagemagick
2. convert -list configure
*/
const captcha = new Captcha();
const Schemas = require('./Schemas.js');
const Redis = require('./Redis.js');
module.exports.drawFile = function () {
  let filename = Schemas.GenerateId();
  let curl = '/assets/captchas/'+ filename + '.png';
  return new Promise((resolve, reject) => {
    //生成图片有问题有可能是要重启或 delegates 没有支持
    captcha.toFile(path.join(process.cwd(), '/public' + curl)).then((text) => {
      resolve({
        text,
        id: Schemas.GenerateId(),
        img: curl,
      })
    }).catch((err) => {
      reject(err)
    });
  })
}
module.exports.drawBuffer = function () {
  return new Promise((resolve, reject) => {
    captcha.toBuffer().then(({buffer, text}) => {
      resolve({
        text,
        id: Schemas.GenerateId(),
        img: 'data:image/png;base64,' + buffer.toString('base64'),
      })
    }).catch((err) => {
      reject(err)
    });
  })
}

//将id与对应的 text 保存在 redis 中，五分钟有效期
module.exports.stowCaptcha = function ({id, text}) {
  if (id && text) {
    Redis.client.setex(Redis.CAPTCHA_NAMESPACE+id, 5*60 , text);
  }
}
//根据id和text在redis中查找并验证
module.exports.verifyCaptcha = function ({id, text}) {
  return new Promise((resolve, reject) => {
    if (id && text && Schemas.ObjectIdValid(id) && text.length == 4) {
      Redis.client.get(Redis.CAPTCHA_NAMESPACE+id, (err, rt) => {
        if (err) reject(err);
        resolve(text == rt);
      });
    } else {
      resolve(false)
    }
  })
}
