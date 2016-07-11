/**
 * A cache key utilities module responsible for building keys for unprocessed and processed phone number lookup results
 * @module key-builder
 * @private
 */
var _ = require('lodash');
var PROVIDER_ERROR = 'Provider name id must be a valid string';
var UNIQUE_ID_ERROR = 'Unique id must be a valid string';

/**
 * validate provider name and uniqueId
 * @param {string} providerName name of the lookup provider ot be used as part of built key
 * @param {string} uniqueId request id that is also part of key
 */
function validateArguments(providerName, uniqueId) {
  if (!_.isString(providerName)) throw new TypeError(PROVIDER_ERROR);
  if (!_.isString(uniqueId)) throw new TypeError(UNIQUE_ID_ERROR);
}

/**
 * Builds the key for unprocessed hlr lookup results
 * @param {string} providerName name of the lookup provider ot be used as part of built key
 * @param {string} uniqueId request id that is also part of key
 * @returns {string} the built key for unprocessed hlr lookup results
 * @throws {TypeError} if no or falsy uniqueId and/or provider name supplied
 */
module.exports.buildUnprocessedCacheKey = function buildUnprocessedCacheKey(providerName, uniqueId) {
  validateArguments(providerName, uniqueId);
  return 'lkp:'+ _.kebabCase(providerName) + ':' +  _.kebabCase(uniqueId);
};

/**
* Builds the key for processed hlr lookup results
* @param {string} providerName name of the lookup provider ot be used as part of built key
* @param {string} phoneNumber phone number that is parsed as integer and added to the key
* @returns {string} the built key for processed hlr lookup result storage
* @throws {TypeError} in case of invalid phone number supplied
*/
module.exports.buildProcessedCacheKey = function buildProcessedCacheKey(providerName, phoneNumber) {
  if (!_.isString(providerName)) throw new TypeError(PROVIDER_ERROR);

  var num = parseInt(phoneNumber, 10);
  if (!_.isFinite(num)) throw new TypeError('Not a valid phone number');

  return 'rst:'+ _.kebabCase(providerName) + ':' + num ;
};

/**
 * Builds key under which phone numbers that are  looked up are stored or should be stored
 * @param {string} providerName name of the lookup provider ot be used as part of built key
 * @param {string} uniqueId request id that is also part of key
 * @returns {string} a key under which phone numbers that are looked up should be stored.
 * @throws {TypeError} if no or falsy uniqueId supplied
 */
module.exports.buildLookupNumbersCacheKey = function buildProcessedCacheKey(providerName, uniqueId) {
  validateArguments(providerName, uniqueId);
  return 'lnums:'+ _.kebabCase(providerName) + ':' +  _.kebabCase(uniqueId);
};

/**
 * Returns a key in format tmr:uniqueId
 * @param {string} uniqueId a unique part of key used to generate and lookup the key value in cache
 * @returns {string} generated key
 * @throws {TypeError} if no or falsy uniqueId supplied
 */
module.exports.buildTimerCacheKey = function buildTimerCacheKey(uniqueId) {
  if (!_.isString(uniqueId)) throw new TypeError(UNIQUE_ID_ERROR);
  return 'tmr:' +  _.kebabCase(uniqueId);
};