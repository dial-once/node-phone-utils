var util = require('util');
var BaseProvider = require('./base_provider');
var SMSAPI = new require('smsapicom');
var smsApi;

/**
 * The smsmapi.com lookups provider class
 * @param name {!string} unique provider name
 * @param username {!string} provider account username
 * @param password {!string} provider account password
 * @constructor
 */
function SMSAPILookupsProvider(name, username, password) {
  BaseProvider.apply(this, arguments);
  smsApi = new SMSAPI();
}

util.inherits(SMSAPILookupsProvider, BaseProvider);

SMSAPILookupsProvider.prototype.hlrLookup = function hlrLookup(number) {

  return smsApi
  .authentication
  .loginHashed(this.username, this.password)
  .then(function () {
    return smsApi
    .hlr
    .check(number)
    .execute()
    .catch(function (err) {
      //some some better error handling as smsapi just returns an object {error: errorCode, message:"txt"}
      if (err instanceof Error) {
        throw err;
      } else {
        if (err && err.message && 'error' in err) {
          throw new Error('Error: ' + err.error + ' ' + err.message);
        } else if (err && err.message) {
          throw new Error(err.message);
        } else {
          throw Error('Unknown Error: ' + JSON.stringify(err, null, 2));
        }
      }
    });
  });
};

module.exports = SMSAPILookupsProvider;

