const Utils = require('../utils/Utils.js');

//通用方法：
module.exports = {
  * saveDoc (doc) {
    if (doc && Object.keys(doc).length) {
      doc = Utils.trimed(doc);
      if (Object.keys(doc).length) {
        let result = yield new this(doc).save();
        result = result.toObject();
        return result;
      }
    }
  },

  * findById (id, query, select) {
    if (id) {
      if (query) {
        query._id = id;
      } else {
        query = {_id: id};
      }
      let result = yield this.findOne(query, select);
      result = result.toObject();
      return result;
    }
  },

  * findByIds (ids, query, select) {
    if (ids && ids.length) {
      if (query) {
        query._id = {$in: ids};
      } else {
        query = {_id: {$in: ids}};
      }
      let results = yield this.find(query, select);
      results.forEach((e,i,a) => {
        a[i] = e.toObject();
      });
      return results;
    }
  },

  * updateSetDoc (id, doc) {
    if (id && doc && Object.keys(doc).length) {
      doc = Utils.trimed(doc);
      if (Object.keys(doc).length) {
        doc.updated_at = new Date();
        return yield this.findOneAndUpdate({_id: id}, {$set:doc}, {new: true});
      }
    }
  },

  * updatePushDoc (id, doc) {
    if (id && doc && Object.keys(doc).length) {
      doc = Utils.trimed(doc);
      if (Object.keys(doc).length) {
        doc.updated_at = new Date();
        return yield this.findOneAndUpdate({_id: id}, {$push:doc}, {new: true});
      }
    }
  },

  * updateIncDoc (id, doc) {
    if (id && doc && Object.keys(doc).length) {
      doc = Utils.trimed(doc);
      if (Object.keys(doc).length) {
        return yield this.findOneAndUpdate({_id: id}, {$inc:doc});
      }
    }
  }
}
