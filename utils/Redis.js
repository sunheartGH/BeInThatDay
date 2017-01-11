const redis = require('redis');
const redisConfig = require('config').redis;
const client = redis.createClient(redisConfig);

client.on("error", (err) => {
  console.log("Redis Error " + err);
});

module.exports.client = client;
module.exports.redis = redis;

module.exports.CAPTCHA_NAMESPACE = 'captcha:';
