/**
 * A client helper that provides the ability to trigger hlrLookup
 * @param {Object} options - mandatory options provider
 * @returns {{hlrLookup: hlrLookup}} object with handy hlrLookup function that return a promise
 */

var resultRetriever = require('../cache/result-retriever');
var _ = require('lodash');
var loggingFunc = require('../logging/logger-message-formatter').getLoggerMessageFunc('hlr-lookup-client');
var getLogger = require('../logging/logger-options-parser').getLoggerFromOptions;
var validateOptions = require('../validators/input-validator').validateAsyncLookupOptions;

/**
 * Creates a hlr lookup client based on provided options
 * @param {object} options the options for the hlr lookup client
 * @returns {{hlrLookup: hlrLookup}}
 * @throws {Error}
 */
module.exports = function createClient(options) {
  validateOptions(options);
  var logger = getLogger(options);

  return {
    /**
     * Perform hlrLookup on numbers
     * @param {Array.<string>} numbers  array of phone numbers to lookup
     * @param {string} [callbackUrl] callback url that takes precedence over options.callbackUrl
     * @param {string} [unid] unique id that gets generated if not supplied
     * @returns {Promise} promise.
     */
    hlrLookup: function hlrLookup(numbers, callbackUrl, unid) {
      var log = loggingFunc('hlr-lookup');
      return options
      .provider
      .asyncHlrLookup.apply(options.provider, [numbers, callbackUrl || options.callbackUrl, options, unid])
      .then(function (result) {
        var resultPromise = Promise.resolve(_.omit(result, ['done', 'uniqueId']));
        if (result.done) {
          logger.debug(log('Done!', {result: result}));
          // it is possible that all lookup numbers came from cache
          // and middleware will not be called.
          if (typeof options.doneCallback === 'function') {
            return resultRetriever
            .getResultsForNumbers(options.cache, result.fromCache, options.provider.name)
            .then(function (lookupResults) {
              options.doneCallback(null, _.map(lookupResults, 'result'), result.uniqueId);
              return resultPromise;
            });
          }
        }
        return resultPromise;
      })
      .catch(function (err) {
        logger.error(log('Error occurred!', {error: err}));
        if (typeof options.doneCallback === 'function') {
          options.doneCallback(err);
        }
        throw err;
      });
    }
  };
};
