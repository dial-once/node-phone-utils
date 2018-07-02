/**
 * A timer cache manager module responsible for processing timers and cleaning up uncompleted lookups.
 * @module timeout-manager
 * @private
 */

var cacheManager = require('cache-manager');
// to cache timers, must be an in memory store.
var timerStore = cacheManager.caching({store: 'memory'});
var buildKey = require('./key-builder').buildTimerCacheKey;
var lnManager = require('./lookup-numbers-manager');
var keyManager = require('./key-manager');
var delKey = require('./utils').delKey;
var loggingFunc = require('../logging/logger-message-formatter').getLoggerMessageFunc('timeout-manager');
var getLogger = require('../logging/logger-options-parser').getLoggerFromOptions;

/**
 * Removes the timer from the internal memory cache
 * @param {string} uniqueId unique id used to compute cache key
 * @param {object} cache the cache itself
 * @returns {Promise} with void result and rejects if operation failed
 */
function removeTimer(uniqueId, cache) {
  try {
    var timerKey = buildKey(uniqueId);
    return delKey(cache, timerKey);
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Gets the timer from cache
 * @param {string} uniqueId unique id used to compute cache key
 * @param {object} cache the cache itself
 * @returns {Promise} whose result is the timer object
 */
function getTimer(uniqueId, cache){
  try {
    var key = buildKey(uniqueId);
    return cache.get(key);
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Sets the timer to cache
 * @param {string} uniqueId unique id used to compute cache key
 * @param {object} cache the cache itself
 * @param {object} timer to be stored in the cache
 * @param {number} ttl time to live in cache
 * @returns {Promise}
 */
function setTimer(uniqueId, cache, timer, ttl){
  try {
    var key = buildKey(uniqueId);
    return cache
    .set(key, timer, {ttl: ttl});
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Starts the timeout for the cleanup to be performed. Cleanup removes helper entries in cache and calls options.doneCallback with results
 * marking the async lookup performed for uniqueId done
 * @param {object} options options containing cache and etc.
 * @param {number} time timeout in ms
 * @param {string} uniqueId request unique id
 * @param {string} providerName name of the lookup provider
 * @returns {Promise} promise of setting the timer to memory cache
 */
function startTimeout(options, time, uniqueId, providerName) {
  var logger = getLogger(options);
  var log = loggingFunc('start-timeout');
  logger.info(log('Starting timeout'), {uniqueId: uniqueId}, {provider: providerName}, {timeout: time});

  if (!options || !options.cache) return Promise.reject(new Error('Invalid or missing options argument'));
  if (!uniqueId) return Promise.reject(new Error('Invalid or missing uniqueId argument'));

  var timer = setTimeout(cleanup, time, options, uniqueId, providerName);

  return setTimer(uniqueId, timerStore, timer, time)
  .catch(function (err) {
    logger.error(log('Error occurred'), {error: err, uniqueId: uniqueId});
    throw err;
  });
}


/**
 * Interrupt ans stop the timeout (cleanup). Should be used once we know async lookup is done.
 * @param {string} uniqueId request unique id
 * @param {object} options options containing cache and etc.
 * @returns {Promise} for deleting a timer reference from the timer memory store
 */
function stopTimeout(uniqueId, options) {
  var logger = getLogger(options);
  var log = loggingFunc('stop-timeout');
  logger.info(log('Stopping timeout'), {uniqueId: uniqueId});


  return getTimer(uniqueId, timerStore)
  .then(function (timerKey) {
    if (timerKey) {
      clearTimeout(timerKey);
      logger.info(log('Timeout stopped'), {uniqueId: uniqueId});
    }
    return removeTimer(uniqueId, timerStore);
  })
  .catch(function (err) {
    logger.error(log('Error'), {error: err, uniqueId: uniqueId});
    throw err;
  });
}

/**
 * Gets lookup results for unique id and calls options.doneCallback with them. Deletes lookupNumbers and timer from cache leaving
 * only results in cache.
 * @param {object} options options containing cache and etc.
 * @param {string} uniqueId request unique id
 * @param {string} providerName name of the hlr lookup provider
 * @returns {Promise<Array<*>>} result of cleanup promises
 */
function cleanup(options, uniqueId, providerName) {
  var logger = getLogger(options);
  var log = loggingFunc('cleanup');
  logger.info(log('Starting cleanup'), {uniqueId: uniqueId}, {provider: providerName});

  if (options && typeof options.doneCallback === 'function') {
    lnManager
    .getLookedUpNumberResults(options.cache, providerName, uniqueId)
    .then(function (results) {
      logger.info(log('doneCallback from cleanup'), {uniqueId: uniqueId}, {provider: providerName});
      options.doneCallback(null, results, uniqueId);
    })
    .catch(function(err){
      logger.error(log('Error in cleanup'), {error: err}, {uniqueId: uniqueId}, {provider: providerName});
      options.doneCallback(err);
    });
  }
  // execute and do cleanup
  var cleanupPromises = [
    lnManager.removeLookedUpNumbers(options.cache, providerName, uniqueId),
    removeTimer(uniqueId, timerStore),
    keyManager.removeCachedKeyIds(options.cache, providerName, uniqueId)
  ];

  return Promise
    .all(cleanupPromises)
    .catch(function (err) {
      logger.error(log('Error in cleanup'), {error: err}, {uniqueId: uniqueId}, {provider: providerName});
      throw err;
  });
}

module.exports = {
  startTimeout: startTimeout,
  stopTimeout: stopTimeout
};