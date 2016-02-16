require('dotenv').config();
var util = require('util');
var BaseProvider = require('./base_provider');
var hlrClient = require('node-hlr-client');

function HLRLookupsProvider() {
  BaseProvider.apply(this, arguments);
  this.hlrClient = new hlrClient(process.env.HLR_LOOKUPS_USERNAME, process.env.HLR_LOOKUPS_PASSWORD)
}

util.inherits(HLRLookupsProvider, BaseProvider);

HLRLookupsProvider.prototype.hlrLookup = function hlrLookup(number) {
  var _this = this;
  return new Promise(function (resolve, reject) {

    //TODO CACHELOOKUP
    var responseHandler = function responseHandler(response){

      if (response.success === true) {
        return resolve(response.results);
      } else {
        return reject(response);
      }

    };

    _this.hlrClient.submitSyncLookupRequest(responseHandler, number);
  });
};

module.exports = new HLRLookupsProvider('hlr-lookups.com');

