/**
 * A hlr lookup provider specialised for hlr.lookups.com.
 * @module hlr-lookups-provider
 * @private
 */

var HlrClient = require('node-hlr-client');
var uuid = require('uuid');
var _ = require('lodash');
var loggingFunc = require('../logging/logger-message-formatter').getLoggerMessageFunc('hlr-lookups-provider');
var getLogger = require('../logging/logger-options-parser').getLoggerFromOptions;
var cacheKeyManager = require('../cache/key-manager');
var lookupNumbersManager = require('../cache/lookup-numbers-manager');
var InputValidator = require('../validators/input-validator');
var PhoneNumberValidator = require('../validators/phone-number-validator');
var HLRResultExtractor = require('../extractors/hlr-result-extractor');

var resultRetriever = require('../cache/result-retriever');
var timeoutManager = require('../cache/timeout-manager');

/**
 * @param name {!string} the name of the provider, should be unique among providers
 * @param username {!string} username of the provider account
 * @param password {!string} username of the provider account
 * @param [logger] {Object} optional logger instance
 * @param [hlrClient] {Object} a hlr lookup client to use and override internal implementation
 * @constructor
 */
function HLRLookupsProvider(name, username, password, logger, hlrClient) {
  this.name = name;
  InputValidator.validateProvider(this, username, password);
  this.logger = getLogger({logger: logger});
  this.hlrClient = hlrClient || new HlrClient(username, password);
  this.validator = PhoneNumberValidator.createInstance({logger: this.logger});
  this.hlrExtractor = HLRResultExtractor.createInstance({logger: this.logger});
}

/**
 * Performs HLR-lookups.com lookup of a phone number
 * @param number {!string} E164 formatted phone number
 * @returns {Promise} If fulfilled then returns a HlrLookup result object, Error if rejected,
 */
HLRLookupsProvider.prototype.hlrLookup = function hlrLookup(number) {

  var logger = this.logger;
  var hlrClient = this.hlrClient;
  var validator = this.validator;

  return new Promise(function (resolve, reject) {
    var logFunc = loggingFunc('hlrLookup');
    if (!validator.isValidSilent(number)) {
      var msg = 'Number: ' + number + ' is not considered a valid e164 formatted phone number.';
      logger.error(logFunc(msg));
      return reject(new Error(msg));
    }

    logger.info(logFunc('Performing HLR lookup for ' + number));

    var responseHandler = function responseHandler(response) {
      logger.info(logFunc('Received HLR Lookup response for ' + number, response));
      if (response.success === true) {
        return resolve(response.results);
      } else {
        logger.warn(logFunc('Received response not deemed successful for number' + number, response));
        return reject(new Error('Request was not successful'));
      }
    };
    hlrClient.submitSyncLookupRequest(responseHandler, number);

  })
  .then(this.hlrExtractor.extract);
};

/**
 * An async HLR lookup initiator the first sets the callbackUlr and then submits numbers for processing retuning a
 * result of numbers that can be processed.
 * @param numbers {string[]}  e164 formatted numbers to be processed
 * @param callbackUrl {string} callbackURl to be used
 * @param options {Object}  valid options object
 * @param [unid] {String} optional unique id that is generated if not provided
 * @returns {Promise} reject if failure, otherwise a resolve with object result = {accepted: [], rejected:[], fromCache:[]}
 * result.accepted is the total list of numbers accepted for hlr lookup
 * results.rejected is the list of numbers rejected by lookup service
 * results.fromCache is the list of numbers whose lookup results were retrieved from cache and were excluded from lookup call.
 * Note that fromCache can contain entries from result.accepted. So the actual phone numbers sent to hlr lookups service are
 * unique numbers from accepted and fromCache arrays.
 */
HLRLookupsProvider.prototype.asyncHlrLookup = function asyncHlrLookup(numbers, callbackUrl, options, unid) {
  var logger = this.logger;
  var name = this.name;
  var hlrClient =  this.hlrClient;
  var logFunc = loggingFunc('asyncHlrLookup');
  var validator = this.validator;
  var uniqueId = unid || uuid.v4();
  if (!options || !options.cache) return Promise.reject(new Error('Invalid options argument'));
  if (!(numbers instanceof Array) || numbers.length === 0) {
    return Promise.reject(new Error('Numbers is not a valid string array'));
  }

  var prepareCallback = function prepareCallback() {
    logger.info(logFunc('prepareCallback for callbackUrl:'), callbackUrl);
    return new Promise(function (resolve, reject) {
      if (!_.isString(callbackUrl) || _.isEmpty(callbackUrl)) {
        return reject(new Error('callbackUrl must be a valid string'));
      }

      var paramPrefix = callbackUrl.indexOf('?') > 0 ? '&' : '?';
      var idxCallbackUrl = callbackUrl + paramPrefix + options.callbackIdQSParam.trim() + '=' + uniqueId;
      return resolve(idxCallbackUrl);
    });
  };

  var getStoredResults = function getStoredResults(cache, phoneNumbers, providerName) {
    return resultRetriever
    .getResultsForNumbers(cache, phoneNumbers, providerName)
    .then(function (cachedResults) {
      var results = [];
      var uncachedNumbers = [];
      var cachedNumbers = [];

      _.each(cachedResults, function (cachedResult) {
        if (cachedResult.found && cachedResult.result) {
          results.push(cachedResult.result);
          cachedNumbers.push(cachedResult.phoneNumber);
        } else {
          uncachedNumbers.push(cachedResult.phoneNumber);
        }
      });
      // these are to be hlr-looked up.
      return {
        numbers: {
          cached: cachedNumbers,
          unCached: uncachedNumbers
        }
      };
    });
  };

  var setAsyncCallbackUrl = function setAsyncCallbackUrl(callbackUrl) {
    return new Promise(function (resolve, reject) {
      logger.info(logFunc('setAsyncCallbackUrl for callbackUrl'),  callbackUrl);

      hlrClient.setAsyncCallbackUrl(function (response) {
        logger.info(logFunc('setAsyncCallbackUrl response'), {response: response});
        if (response && _.includes([true, 'true'], response.success)) {
          return resolve(true);
        } else {
          logger.error(logFunc('Failed to set callbackUlr.'), {response: response, callbackUrl: callbackUrl});
          return reject(new Error('Failed to set callbackUlr.'));
        }
      }, callbackUrl);
    });
  };

  var submitAsyncLookupRequest = function submitAsyncLookupRequest(e164Numbers) {
    return new Promise(function (resolve, reject) {
      logger.info(logFunc('Performing async HLR lookup for ' + e164Numbers));
      hlrClient.submitAsyncLookupRequest(function (response) {
        logger.info(logFunc('submitAsyncLookupRequest response'), {response: response});

        if (response && _.includes([true, 'true'], response.success)) {

          if (!_.isEmpty(response.results)) {
            var accepted = response.results.acceptedMsisdns;
            var keyIds = [];
            var acceptedNumbers = [];
            var rejectedMsisdns = response.results.rejectedMsisdns;
            var rejectedNumbers = _.map(rejectedMsisdns, 'msisdn');

            _.each(accepted, function (acceptedNumber) {
              keyIds.push(acceptedNumber.id);
              acceptedNumbers.push(acceptedNumber.msisdn);
            });

            return cacheKeyManager
            .cacheKeyIds(options.cache, name, uniqueId, keyIds)
            .then(function () {
              return resolve({
                accepted: acceptedNumbers,
                rejected: rejectedNumbers
              });
            })
            .catch(reject);

          } else {
            logger.error(logFunc('submitAsyncLookupRequest response'), {response: response});
            return reject(new Error('Unable to read results from provider response.'));
          }

        } else {
          logger.error(logFunc('submitAsyncLookupRequest response'), {response: response});
          return reject(new Error('Failed to perform hlr lookup.'));
        }
      }, e164Numbers);
    });
  };

  var invalidNumbers =[];
  var validPhoneNumbers = [];
  _.each(numbers, function(pNumber){
    (validator.isValidSilent(pNumber) ? validPhoneNumbers : invalidNumbers).push(pNumber);
  });

  return getStoredResults(options.cache, validPhoneNumbers, name)
  .then(function (storedResults) {
    var unCached = storedResults.numbers.unCached;
    var isDone = _.isEmpty(unCached);

    if (isDone) return storedResults;

    return prepareCallback()
    .then(setAsyncCallbackUrl)
      .then(function(){
        return storedResults;
      });
  })
  .then(function (result) {
    var unCached = result.numbers.unCached;
    var isDone = _.isEmpty(unCached);
    // only do lookup if there are numbers to lookup
    if (isDone) {
      return {
        done: isDone,
        uniqueId: uniqueId,
        accepted: result.numbers.cached, //cached numbers are also accepted
        fromCache: result.numbers.cached,
        rejected: _.union(invalidNumbers, result.numbers.rejected)
      };
    } else {
      return submitAsyncLookupRequest(unCached)
      .then(function (resultNumbers) {
        resultNumbers.done = isDone;
        resultNumbers.uniqueId = uniqueId;
        resultNumbers.fromCache = result.numbers.cached;
        resultNumbers.rejected = _.union(invalidNumbers, resultNumbers.rejected);
        //cached numbers are also accepted
        resultNumbers.accepted = _.union(result.numbers.cached, resultNumbers.accepted);
        return resultNumbers;
      });
    }
  })
  .then(function (result) {
    var promise;
    if (!result.done) {
      timeoutManager.startTimeout(options, parseInt(options.lookupTimeout, 10) * 1000, uniqueId, name);
      promise = lookupNumbersManager.storeLookedUpNumbers(options.cache, name, uniqueId, result.accepted);
    } else {
      timeoutManager.stopTimeout(uniqueId, options);
      promise = lookupNumbersManager.removeLookedUpNumbers(options.cache, name, uniqueId, result.accepted);
    }
    return promise
    .then(function () {
      return result;
    });
  });
};

/**
 * This function is used to process incoming hlr-lookups.com result requests that come into callback middleware
 * and extract data into a common format.
 * @param {object} req Hlr-Lookups.com async request that came in to middleware carrying lookup results.
 * @param {object} options options object containing cache and other properties.
 * @returns {Promise} a promise with extracted data from req if successful.
 */
HLRLookupsProvider.prototype.processResultReq = function processResultReq(req, options) {
  var logger = this.logger;
  var hlrExtractor = this.hlrExtractor;
  var name = this.name;

  // specific implementation for hlrLookups.com responses.
  return new Promise(function (resolve, reject) {
    var logFunc = loggingFunc('process-result-req');
    var json = _.get(req, 'body.json');
    if (!json) {
      return reject(new Error('Input request does no have valid body.json object'));
    }

    if (_.isString(json)) {
      json = JSON.parse(json);
    }

    var returnObj = {reqId: req.query[options.callbackIdQSParam]};
    // hlr-lookups.com supper said success is not false ever
    if (_.isEmpty(json.results)) {
      logger.error(logFunc('No results in request.'), {json: json});
      return reject(new Error('No results in request.'));
    }
    returnObj.results = json.results;
    return resolve(returnObj);
  })
  .then(function (reqInfoObj) {
    var results = reqInfoObj.results;
    return hlrExtractor
    .extract(results)
    .then(function (processedResults) {
      // update any keyIds with processed results
      return cacheKeyManager
      .processResultKeyIds(options.cache, name, reqInfoObj.reqId, results, processedResults);
    })
    .then(function (results) {
      if (results.done) timeoutManager.stopTimeout(reqInfoObj.reqId, options);
      return results;
    });
  });
};

module.exports = HLRLookupsProvider;
