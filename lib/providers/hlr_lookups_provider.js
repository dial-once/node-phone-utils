var util = require('util');
var BaseProvider = require('./base_provider');
var hlrClient = require('node-hlr-client');

/**
 * @param name {!string} the name of the provider, should be unique among providers
 * @param username {!string} username of the provider account
 * @param password {!password} username of the provider account
 * @constructor
 */
function HLRLookupsProvider() {
  BaseProvider.apply(this, arguments);
  this.hlrClient = new hlrClient(this.username, this.password);
}

util.inherits(HLRLookupsProvider, BaseProvider);

HLRLookupsProvider.prototype.hlrLookup = function hlrLookup(number) {

  return new Promise(function (resolve) {

    //TODO, Put here for testing purposes and not to spend money by calling the service when testing
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

