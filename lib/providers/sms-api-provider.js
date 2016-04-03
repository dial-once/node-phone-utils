var SMSAPI = require('smsapicom');
var loggingFunc = require('../logging/logger-message-formatter').getLoggerMessageFunc('sms-api-provider');
var getLogger = require('../logging/logger-options-parser').getLoggerFromOptions;
var InputValidator = require('../validators/input-validator');
var PhoneNumberValidator = require('../validators/phone-number-validator');
var HLRResultExtractor = require('../extractors/hlr-result-extractor');

/**
 * The smsapi.com lookups provider class
 * @param name {!string} unique provider name
 * @param username {!string} provider account username
 * @param password {!string} provider account password
 * @param [logger] {!Object} optional logger instance
 * @param [hlrClient] {Object} optional hlr client that takes precedence over internal one
 * @constructor
 */
function SMSAPILookupsProvider(name, username, password, logger, hlrClient) {
  this.name = name;
  InputValidator.validateProvider(this, username, password);
  this.logger = getLogger({logger: logger});
  this.validator = PhoneNumberValidator.createInstance({logger: this.logger});
  this.hlrExtractor = HLRResultExtractor.createInstance({logger: this.logger});
  this.smsApi = hlrClient || new SMSAPI();
  this.smsApiAuthPromise = this.smsApi.authentication.loginHashed(username, password);
}

SMSAPILookupsProvider.prototype.hlrLookup = function hlrLookup(number) {
  var logger = this.logger;
  var validator = this.validator;
  var smsApi = this.smsApi;
  var smsApiAuthPromise = this.smsApiAuthPromise;

  return new Promise(function (resolve, reject) {
    var logFunc = loggingFunc('hlrLookup');

      if (!validator.isValidSilent(number)) {
        var msg = 'Number: ' + number + ' is not considered a valid e164 formatted phone number.';
        logger.error(logFunc(msg));
        return reject(new Error(msg));
      }

    logger.info(logFunc('Starting HlrLookup of ' + number));

    return smsApiAuthPromise
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
  })
  .then(this.hlrExtractor.extract);
};

module.exports = SMSAPILookupsProvider;

