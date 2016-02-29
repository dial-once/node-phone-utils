var util = require('util');
var BaseProvider = require('./base_provider');
var hlrClient = require('node-hlr-client');
var loggingFunc = require('../helpers/logger_message_formatter').getLoggerMessageFunc('hlr_lookups_provider');
var dummyResponse;

/**
 * @param name {!string} the name of the provider, should be unique among providers
 * @param username {!string} username of the provider account
 * @param password {!password} username of the provider account
 * @param [logger] {!Object} optional logger instance
 * @constructor
 */
function HLRLookupsProvider() {
  BaseProvider.apply(this, arguments);
  this.hlrClient = new hlrClient(this.username, this.password);
}

util.inherits(HLRLookupsProvider, BaseProvider);

HLRLookupsProvider.prototype.hlrLookup = function hlrLookup(number) {

  var logger = this.logger;
  var providerEnabled = this.isProviderEnabled;
  var hlrClient = this.hlrClient;

  return new Promise(function (resolve, reject) {

    var logFunc = loggingFunc('hrlLookup');

    if (!providerEnabled) {
      logger.info(logFunc('Returning dummy lookup result because actual calls are prohibited (env ENABLE_HLR_LOOKUPS not set to true)' ));
      if (! dummyResponse) {
        dummyResponse = require('./dummy_data/hlr_lookups_provider.json').data;
      }
      return resolve(dummyResponse);
    } else {
      logger.info(logFunc('Performing HLR lookup for ' + number));
      //TODO CACHELOOKUP
      var responseHandler = function responseHandler(response) {
        logger.info(logFunc('Received response for ' + number, response));
        if (response.success === true) {
          return resolve(response.results);
        } else {
          logger.warn(logFunc('Received response not deemed successful for number'+  number, response));
          return reject(response);
        }

      };
      hlrClient.submitSyncLookupRequest(responseHandler, number);
    }

  });
};

module.exports = HLRLookupsProvider;

