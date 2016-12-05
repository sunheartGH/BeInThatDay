const mongoose = require('mongoose'),
      all = require('../utils/RequireAll.js'),
      Utils = require('../utils/Utils.js'),
      path = require("path"),
      config = require('config').mongodb;

mongoose.connect(config.url);

mongoose.connection.on('connected', () => {
  console.log('Mongoose connection to: ', config.url);
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection to %s error: ', config.url, err.message);
  process.exit(1);
});
mongoose.connection.on('disconnected', ()  => {
  console.log('Mongoose connection disconnected');
});

module.exports  = all({
  dirname: __dirname,
  filter: /^(?!index)(?!base)(.+)\.js$/,
  recursive: true,
  resolve (model, file) {
    if (model && model.schema) {
      // Duplicate the ID field.
      model.schema.virtual('id').get(function () {
        if (this && this._id){
          return this._id.toHexString();
        }
      });
      // Ensure virtual fields are serialised.
      model.schema.set('toJSON', {virtuals: true});
      // Ensure virtuals in output when using console.log(obj)
      model.schema.set('toObject', { virtuals: true });
    }
    return model;
  }
});
