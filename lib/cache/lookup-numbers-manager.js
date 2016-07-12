/**
 * A cache key manager module responsible for storing and processing of result ids under a key and hlr lookup results.
 * @module lookup-numbers-manager
 * @private
 */
var keyBuilder = require('./key-builder');
var getResultsForNumbers = require('./result-retriever').getResultsForNumbers;
var delKey = require('./utils').delKey;

/**
 * Store the looked up phone numbers array per unique id
 * @param {object} cache valid cache-manager cache instance
 * @param {string} providerName name of the hlr lookup provider
 * @param {string} uniqueId unique request id.
 * @param numbers phone numbers being looked up
 * @returns {Promise} result of setting to cache
 */
module.exports.storeLookedUpNumbers = function storeLookedUpNumbers(cache, providerName, uniqueId, numbers) {
  try {
    var key = keyBuilder.buildLookupNumbersCacheKey(providerName, uniqueId);
    return cache.set(key, numbers);
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Delete the looked up numbers
 * @param {object} cache valid cache-manager cache instance
 * @param {string} providerName name of the hlr lookup provider
 * @param {string} uniqueId unique request id.
 * @returns {Promise} result of deleting from cache
 */
module.exports.removeLookedUpNumbers = function removeLookedUpNumbers(cache, providerName, uniqueId) {
  try {
    var key = keyBuilder.buildLookupNumbersCacheKey(providerName, uniqueId);
    return delKey(cache, key);
  } catch (e) {
    return Promise.reject(e);
  }
};

/**
 * Gets the results stored in cache for looked up numbers per unique id
 * @param {object} cache valid cache-manager cache instance
 * @param {string} providerName name of the hlr lookup provider
 * @param {string} uniqueId unique request id.
 * @returns {Promise} results from cache or reject with error
 */
module.exports.getLookedUpNumberResults = function getLookedUpNumberResults(cache, providerName, uniqueId) {
  var key;
  try {
    key = keyBuilder.buildLookupNumbersCacheKey(providerName, uniqueId);
  } catch (e) {
    return Promise.reject(e);
  }

  return cache
  .get(key)
  .then(function (numbers) {
    return getResultsForNumbers(cache, numbers, providerName);
  })
  .then(function (resultContainers) {
    return resultContainers.map(function (resultObj) {
      return resultObj.result;
    })
    .filter(function (result) {
      // remove falsy values
      return result;
    });
  });
};