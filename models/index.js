const mongoose = require('mongoose'),
      all = require('require-all'),
      config = require('config-lite').mongodb;

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
  filter: /^(?!index)(.+)\.js$/,
  recursive: true,
  resolve: function (model) {
    let schema = model.schema;
    if (schema) {
      // Duplicate the ID field.
      schema.virtual('id').get(function () {
        if (this && this._id){
          return this._id.toHexString();
        }
      });
      // Ensure virtual fields are serialised.
      schema.set('toJSON', {virtuals: true});
      // Ensure virtuals in output when using console.log(obj)
      schema.set('toObject', { virtuals: true });
    }
    return model;
  }
});
