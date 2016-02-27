var util = require('util');
var BaseProvider = require('./base_provider');
var hlrClient = require('node-hlr-client');

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
  return new Promise(function (resolve) {
    logger.info ('Performing HLR lookup for ' + number);
    //TODO, Put here for testing purposes and not to spend money by calling the service when testing
    logger.info ('returning dummy result because actual calls are prohibited');
    return resolve({test: 'test', number: number});

    //TODO CACHELOOKUP
    /**var responseHandler = function responseHandler(response) {

      if (response.success === true) {
        return resolve(response.results);
      } else {
        return reject(response);
      }

    };

    _this.hlrClient.submitSyncLookupRequest(responseHandler, number);
     **/
  });
};

module.exports = HLRLookupsProvider;

