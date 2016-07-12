/**
 * A cache key manager module responsible for storing and processing of result ids under a key and hlr lookup results.
 * @module key-manager
 * @private
 */

var delKey = require('./utils').delKey;
var keyBuilder = require('./key-builder');

/**
 * Stores the list of unprocessed result ids under a key
 * @param {object} cache to use for storage
 * @param {string} providerName  name of the provider
 * @param {string} uniqueId  request unique id
 * @param {string[]} keyIds  the keys with ids to store
 * @returns {Promise} the result of storing via cache.set or error if rejected.
 */
module.exports.cacheKeyIds = function cacheKeyIds(cache, providerName, uniqueId, keyIds) {
  try {
    var key = keyBuilder.buildUnprocessedCacheKey(providerName, uniqueId);
    return cache.set(key, keyIds);
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Removes the list of unprocessed result ids
 * @param {object} cache to use for storage
 * @param {string} providerName  name of the provider
 * @param {string} uniqueId request unique id
 * @returns {Promise} the result of removing via cache.del or error if rejected.
 */
module.exports.removeCachedKeyIds = function cacheKeyIds(cache, providerName, uniqueId) {
  try {
    var key = keyBuilder.buildUnprocessedCacheKey(providerName, uniqueId);
    return delKey(cache, key);
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Processes results, updates any cached key ids, deletes if no more to process, stores processed results to processed key for further reuse.
 * @param {object} cache to use for storage
 * @param {string} providerName  name of the hl lookup provider
 * @param {string} uniqueId request unique id
 * @param {object[]} results the results received and to be processed
 * @param {object[]} processedResults the processed results that get stored
 * @returns {Promise} resolves to {results: processedResults, done: Boolean} object or rejects with error
 */
module.exports.processResultKeyIds = function processResultKeyIds(cache, providerName, uniqueId, results, processedResults) {
  var unprocessedKey;
  try {
    unprocessedKey = keyBuilder.buildUnprocessedCacheKey(providerName, uniqueId);
  } catch (e) {
    return Promise.reject(e);
  }

  if (!(results instanceof Array)) return Promise.reject(new Error('Result must be an array'));
  if (!(processedResults instanceof Array)) return Promise.reject(new Error('processedResults must be an array'));

  var promises = results.map(function (result, index) {
    var processedKey = keyBuilder.buildProcessedCacheKey(providerName, result.msisdn);
    return cache
    .get(unprocessedKey)
    .then(function (keyIds) {
      // if no more unprocessed KeyIds then we are done
      if (!keyIds || keyIds.length === 0) {
        return delKey(cache, unprocessedKey);
      }

      // remove resultId from keyIds in storage
      var idIndex = keyIds.indexOf(result.id);

      if (idIndex > -1) {
        keyIds.splice(idIndex, 1);
        return cache.set(unprocessedKey, keyIds);
      }
    })
    .then(function () {
      // store results;
      return cache.set(processedKey, processedResults[index]);
    });
  });

  return Promise
  .all(promises)
  .then(function () {
    return cache.get(unprocessedKey);
  })
  .then(function (keyIds) {
    var isDone = !keyIds || keyIds.length === 0;
    return {results: processedResults, done: isDone};
  });
};
