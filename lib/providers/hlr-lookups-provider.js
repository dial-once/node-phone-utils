var util = require('util');
var BaseProvider = require('./base-provider');
var HlrClient = require('node-hlr-client');
var loggingFunc = require('../helpers/logger-message-formatter').getLoggerMessageFunc('hlr_lookups_provider');
var dummyResponse;

/**
 * @param name {!string} the name of the provider, should be unique among providers
 * @param username {!string} username of the provider account
 * @param password {!password} username of the provider account
 * @param [logger] {!Object} optional logger instance
 * @constructor
 */
function HLRLookupsProvider(name, username, password, logger) {
  BaseProvider.apply(this, [name, username, password, logger]);
  this.hlrClient = new HlrClient(this.username, this.password);
}

util.inherits(HLRLookupsProvider, BaseProvider);

/**
 * Performs HLR-lookups.com lookup of a phone number
 * @param number {!string} E164 formatted phone number
 * @returns {Promise} If fulfilled then returns a HlrLookup result object, Error if rejected,
 */
HLRLookupsProvider.prototype.hlrLookup = function hlrLookup(number) {

  var logger = this.logger;
  var providerEnabled = this.isProviderEnabled;
  var hlrClient = this.hlrClient;
  var validator = this.validator;

  return new Promise(function (resolve, reject) {

    var logFunc = loggingFunc('hlrLookup');
    if (!validator.isValid(number)) {
      var msg = 'Number: ' + number + ' is not considered a valid e164 formatted phone number.';
      logger.error(logFunc(msg));
      return reject(new Error(msg));
    }

    if (!providerEnabled) {
      logger.info(logFunc('Returning dummy lookup result because actual calls are prohibited (env ENABLE_HLR_LOOKUPS not set to true)'));
      if (!dummyResponse) {
        dummyResponse = require('./dummy_data/hlr-lookups-provider.json').data;
      }
      return resolve(dummyResponse);
    } else {
      logger.info(logFunc('Performing HLR lookup for ' + number));

      var responseHandler = function responseHandler(response) {
        logger.info(logFunc('Received HLR Lookup response for ' + number, response));
        if (response.success === true) {
          return resolve(response.results);
        } else {
          logger.warn(logFunc('Received response not deemed successful for number' + number, response));
          return reject(response);
        }

      };

      hlrClient.submitSyncLookupRequest(responseHandler, number);
    }

  })
  .then(this.hlrExtractor.extract);
};

module.exports = HLRLookupsProvider;

