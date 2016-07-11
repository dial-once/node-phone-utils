/**
 * A cache  module responsible for getting processed results.
 * @module result-retreiver
 * @private
 */
var keyBuilder = require('./key-builder');

/**
 * Gets result objects with results for given phone numbers from cache
 * @param {object} cache the cache to use to lookup up the results
 * @param {string []} phoneNumbers phone numbers
 * @param {string} providerName name of the lookup provider
 * @returns {Promise} with array of result objects ( {phoneNumber:, found: bool, result: obj}) if not rejected
 */
module.exports.getResultsForNumbers = function getResultsForNumbers(cache, phoneNumbers, providerName) {
  if (!cache) return Promise.reject(new Error('Cache argument must be supplied'));
  if (!phoneNumbers) phoneNumbers = [];
  if (! (phoneNumbers instanceof Array)) return Promise.reject(new Error('Numbers argument must be an array'));

  var numberPromises = phoneNumbers.map(function (phoneNumber) {
    var numberKey = keyBuilder.buildProcessedCacheKey(providerName, phoneNumber);
    return cache
    .get(numberKey)
    .then(function (result) {
      return {
        phoneNumber: phoneNumber,
        found: typeof result === 'object',
        result: result
      };
    });
  });

  return Promise.all(numberPromises);
};
