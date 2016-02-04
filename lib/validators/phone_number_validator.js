/**
 * A phone number utilities validator module based on google phone number lib!
 * @module phone-number-validator
 */

var InputValidator = require('./input_validator');
var loggerFacade = require('../helpers/logger_facade');
var defaultLogger = loggerFacade.getLoggerFacade({});
var libPhoneNumber = require('google-libphonenumber');
var phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
var PhoneNumberType = libPhoneNumber.PhoneNumberType;
var format = require('util').format;
var LOG_PREFIX = '[phone-number-utils:phone-number-validator:%s] %s';

/**
 * This is a helper method for building a a logging entry
 * @param functionName - name of the function that is invoking
 * @param logMessage - message or object to be logged
 */
function formatLogEntry(functionName, logMessage) {
  return format(LOG_PREFIX, functionName, logMessage);
}

/**
 * Function to get a Google Phone number from @param phoneNumber
 * @param phoneNumber - phoneNumber to parse
 * @param regionCode - regionCode of phone number
 * @returns {Promise} - Resolves to a google phone number object or rejects with error
 */
function getGPhoneNumber(phoneNumber, regionCode, logger) {

  return new Promise(function (resolve) {
    var formatLEgetGPN = function formatLEgetGPN(logMsg) {
      return formatLogEntry('get-G-phone-number', logMsg);
    };

    var gPhoneNum;

    if (regionCode && typeof  regionCode === 'string' && regionCode.length > 0) {
      logger && logger.debug(formatLEgetGPN('Got valid regionCode so progressing with it'));
      // this method is faster if we have region code;
      gPhoneNum = phoneUtil.parse(phoneNumber, regionCode);
    } else {
      logger && logger.debug(formatLEgetGPN('Parsing phoneNumber without valid region code'));
      gPhoneNum = phoneUtil.parse(phoneNumber);
    }

    return resolve(gPhoneNum);
  });
}

function PNValidator(logger) {

  return {
    /**
     * Check if the phone number is valid
     * @param phoneNumber - phone number to test
     * @param regionCode - (optional)region code of phone number
     * @returns {Promise} - Resolves to true or false or rejects with error.
     */
    isValid: function isValid(phoneNumber, regionCode) {
      return new Promise(function (resolve, reject) {

        var formatLEIsValid = function formatLEIsValid(logMsg) {
          return formatLogEntry('is-valid', logMsg);
        };

        logger.info(formatLEIsValid('Starting phoneNumber: ' + phoneNumber + ' regionCode: ' + regionCode));

        if (!InputValidator.isValidInput(phoneNumber, true)) {
          var err = new TypeError('Phone number: ' + phoneNumber + ' is not a valid input type (string or string array).');
          logger.error(formatLEIsValid(err.message));
          throw err;
        } else {

          return getGPhoneNumber(phoneNumber, regionCode, logger)
            .then(function (gPhoneNum){
              var isPhoneNumberValid = phoneUtil.isValidNumber(gPhoneNum);
              logger.info(formatLEIsValid('Result is ' + isPhoneNumberValid));
              return resolve(isPhoneNumberValid);
            })
            .catch(reject);
        }

      });
    },

    /**
     * This function checks if the number is a mobile number
     * @function
     * @param phoneNumber - phone number to test
     * @param regionCode - (optional)region code of phone number
     * @returns {Promise} - Resolves to true or false or rejects with error.
     */
    isMobile: function isMobile(phoneNumber, regionCode) {

      var formatLEIsMobile = function formatLEIsMobile(logMsg) {
        return formatLogEntry('is-mobile', logMsg);
      };

      return this
      .isValid(phoneNumber, regionCode)
      .then(function checkValid(isValid) {
        logger.debug(formatLEIsMobile('Checking phone number validity.'));
        if (isValid !== true) {
          logger.debug(formatLEIsMobile('phoneNumber is not valid.'));
          var errMsg = 'PhoneNumber:' + phoneNumber + ' regionCode:' + regionCode + ' are not valid so mobile check cannot be performed.';
          logger.error(formatLEIsMobile(errMsg));
          return Promise.reject(new Error(errMsg));
        } else {
          logger.debug(formatLEIsMobile('phoneNumber is valid.'));
          return getGPhoneNumber(phoneNumber, regionCode, logger);
        }
      })
        .then(function (gPhoneNum){
          var pnType = phoneUtil.getNumberType(gPhoneNum);
          var isPhoneNumMobile = (pnType === PhoneNumberType.MOBILE || pnType === PhoneNumberType.FIXED_LINE_OR_MOBILE);
          logger.debug(formatLEIsMobile('Result if phone is mobile: .' + isPhoneNumMobile));
          return Promise.resolve(isPhoneNumMobile);
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
