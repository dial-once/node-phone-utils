/**
 * Promisifies the cache.del
 * @param {object} cache
 * @param {string} key to delete
 * @returns {Promise} Result of cache.del or reject with error
 */
module.exports.delKey = function delKey(cache, key) {
  return new Promise(function (resolve, reject) {
    if (typeof key !== 'string' || key.length === 0) {
      return reject(new TypeError('Key must be a valid string'));
    }

    return cache.del(key, function (err, val) {
      if (err) return reject(err);
      return resolve(val);
    });
  });
};
