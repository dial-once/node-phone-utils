/**
 * A phone number utilities validator module based on google phone number lib!
 * @module phone-number-validator
 */

var InputValidator = require('./input_validator');
var loggerFacade = require('../helpers/logger_facade');
var defaultLogger = loggerFacade.getLoggerFacade({});
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var LOG_PREFIX = '[phone-number-utils:phone-number-validator:%s] %s';

function PNValidator(logger) {

  return {
    /**
     * Check if the phone number is valid
     * @param phoneNumber - phone number to test
     * @param regionCode - (optional)region code of phone number
     * @returns {Promise} - Resolves to true or false or rejects with error.
     */
    isValid: function isValid(phoneNumber, regionCode) {
      return new Promise(function (resolve) {

        logger.info(LOG_PREFIX, 'is-valid', 'Starting phoneNumber: ' + phoneNumber + ' regionCode: ' + regionCode);

        if (!InputValidator.isValidInput(phoneNumber, true)) {
          var errMsg = 'Phone number: ' + phoneNumber + ' is not a valid input type.';
          logger.error(LOG_PREFIX, 'is-valid', errMsg);
          throw new TypeError(errMsg);
        } else {

          var gPhoneNum;
          var isPhoneNumberValid;

          if (regionCode && typeof  regionCode === 'string' && regionCode.length > 0) {
            logger.debug(LOG_PREFIX, 'is-valid', 'Got valid regionCode so progressing with it');
            // this method is faster if we have country code;
            gPhoneNum = phoneUtil.parse(phoneNumber, regionCode);
            isPhoneNumberValid = phoneUtil.isValidNumberForRegion(gPhoneNum, regionCode);
          } else {
            logger.debug(LOG_PREFIX, 'is-valid', 'Checking without valid region code');
            gPhoneNum = phoneUtil.parse(phoneNumber);
            isPhoneNumberValid = phoneUtil.isValidNumber(gPhoneNum);
          }

          logger.info(LOG_PREFIX, 'is-valid', 'Result is ' + isPhoneNumberValid);
          return resolve(isPhoneNumberValid);
        }

      });
    }
  };
}

/**
 * This function returns another instance of Phone Number validator
 * @param options - options that can contain a logger
 * @returns {PNValidator} - new PNValidator object instance
 */
module.exports.getInstance = function getInstance(options) {
  var logger = options && options.logger ? loggerFacade.getLoggerFacade(options.logger) : defaultLogger;
  return new PNValidator(logger);
};
