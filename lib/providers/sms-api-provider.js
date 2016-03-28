var util = require('util');
var BaseProvider = require('./base-provider');
var SMSAPI = require('smsapicom');
var smsApi;
var dummyResponse;
var loggingFunc = require('../helpers/logger-message-formatter').getLoggerMessageFunc('sms_api_provider');

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
  var providerEnabled = this.isProviderEnabled;
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
        dummyResponse = require('./dummy_data/sms-api-provider.json').data;

      }
      //smsapi.com returns an object for a single number not array
      return resolve(util.isArray(dummyResponse) ? dummyResponse[0] :dummyResponse);
    } else {

      logger.info(logFunc('Starting HlrLookup of ' + number));

      return smsApi
      .authentication
      .loginHashed(uname, password)
      .then(function () {

        logger.info(logFunc('Successfully supplied auth info for provider'));

        return smsApi
        .hlr
        .check()
        .number(number)
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
    }
  })
  .then(this.hlrExtractor.extract);
};

module.exports = SMSAPILookupsProvider;

