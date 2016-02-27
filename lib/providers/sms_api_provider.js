var util = require('util');
var BaseProvider = require('./base_provider');
var SMSAPI = new require('smsapicom');
var smsApi;
var loggingFunc = require('../helpers/logger_message_formatter').getLoggerMessageFunc('sms_api_provider');

/**
 * The smsapi.com lookups provider class
 * @param name {!string} unique provider name
 * @param username {!string} provider account username
 * @param password {!string} provider account password
 * @param [logger] {!Object} optional logger instance
 * @constructor
 */
function SMSAPILookupsProvider(name, username, password, logger) {
  BaseProvider.apply(this, [name, username, password, logger]);
  smsApi = new SMSAPI();
}

util.inherits(SMSAPILookupsProvider, BaseProvider);

SMSAPILookupsProvider.prototype.hlrLookup = function hlrLookup(number) {
  var logger = this.logger;
  var uname = this.username;
  var password = this.password;

  return new Promise(function (resolve, reject) {

    var logFunc = loggingFunc('hrlLookup');
    logger.info(logFunc('Starting HlrLookup of ' + number));

     return smsApi
    .authentication
    .loginHashed(uname, password)
    .then(function () {
      logger.info(logFunc('Successfully supplied auth info for provider'));

      return smsApi
      .hlr
      .check(number)
      .execute()
      .then(function (result) {
        logger.info(logFunc('HlrLookup returned a result'), result);
        return resolve(result);
      })
      .catch(function (err) {
        logger.error(logFunc('HlrLookup returned an error'), err);
        //done some some better error handling as smsapi just returns an object {error: errorCode, message:"txt"}
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
      })
        .catch(reject);

    });

  });
};

module.exports = SMSAPILookupsProvider;

