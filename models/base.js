const Utils = require('../utils/Utils.js');

//通用方法：
module.exports = {
  * saveDoc (doc) {
    if (doc && Object.keys(doc).length) {
      doc = Utils.trimed(doc);
      if (Object.keys(doc).length) {
        let result = yield new this(doc).save();
        if (result) {
          result = result.toObject();
        }
        return result;
      }
    }
  },

  * findById (id, query, select) {
    if (id) {
      query = query || {};
      query = Utils.trimed(query);
      query._id = id;
      let result = yield this.findOne(query, select);
      if (result) {
        result = result.toObject();
      }
      return result;
    }
  },

  * findByIds (ids, query, select) {
    if (ids && ids.length) {
      query = query || {};
      query = Utils.trimed(query);
      query._id = {$in: ids};
      let results = yield this.find(query, select);
      if (results) {
        results.forEach((e,i,a) => {
          a[i] = e.toObject();
        });
      }
      return results;
    }
  },

  * findByPage(page, query, select) {
    if (page) {
      query = query || {};
      query = Utils.trimed(query);
      query.created_at = {};
      if (page.lastime) {
        Object.assign(query.created_at, {$lt: page.lastime});
      }
      if (page.firstime) {
        Object.assign(query.created_at, {$gt: page.firstime});
      }
      let results = yield this.find(query, select).skip(page.offset).limit(page.size);
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

  * updatePullDoc (id, doc) {
    if (id && doc && Object.keys(doc).length) {
      doc = Utils.trimed(doc);
      if (Object.keys(doc).length) {
        doc.updated_at = new Date();
        return yield this.findOneAndUpdate({_id: id}, {$pull:doc}, {new: true});
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
