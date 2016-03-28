/**
 * A phone number utilities validator module based on google phone number lib!
 * @module phone-number-validator
 * @private
 */

var InputValidator = require('./input-validator');
var getLogger = require('../helpers/logger-options-parser').getLoggerFromOptions;
var PNExtractor = require('../extractors/phone-number-extractor');
var libPhoneNumber = require('google-libphonenumber');
var phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
var PhoneNumberType = libPhoneNumber.PhoneNumberType;

/**
 * @private
 * @type {logFunction}
 */
var loggingFunc = require('../helpers/logger-message-formatter').getLoggerMessageFunc('phone-number-validator');

/**
 * Phone number validator utility class
 * @private
 * @param logger non optional (or facaded) logger
 * @returns {{isValid: isValid, isMobile: isMobile}}
 * @constructor
 */
function PNValidator(logger) {
  var pnExtractor = PNExtractor.createInstance({logger: logger});

  return {
    /**
     * Check if the phone number is valid
     * @param phoneNumber - phone number to test
     * @param regionCode - (optional)region code of phone number
     * @returns {Boolean} - true or false or throws error.
     */
    isValid: function isValid(phoneNumber, regionCode) {

      var formatLEIsValid = loggingFunc('is-valid');

      logger.info(formatLEIsValid('Starting phoneNumber: ' + phoneNumber + ' regionCode: ' + regionCode));

      if (!InputValidator.isValidInput(phoneNumber, false)) {
        var err = new TypeError('Phone number: ' + phoneNumber + ' is not a valid input type (string).');
        logger.error(formatLEIsValid(err.message));
        throw err;
      } else if (InputValidator.isShortNumber(phoneNumber)) {
        //TODO this should be removed once there is a db of small numbers that could be used for validation
        var toShortErr = new TypeError('Phone number: ' + phoneNumber + ' is a too short number to be validated.');
        logger.error(formatLEIsValid(toShortErr.message));
        throw toShortErr;
      } else {

        var gPhoneNum = pnExtractor.getGooglePhoneNumber(phoneNumber, regionCode);
        var isPhoneNumberValid = phoneUtil.isValidNumber(gPhoneNum);
        logger.info(formatLEIsValid('Result is ' + isPhoneNumberValid));
        return isPhoneNumberValid;
      }

    },

    /**
     * This function checks if the number is a mobile number
     * @function
     * @param phoneNumber {string} - phone number to test
     * @param [regionCode] {string} - (optional)region code of phone number
     * @returns {Boolean} - true or false or throws error.
     */
    isMobile: function isMobile(phoneNumber, regionCode) {

      var formatLEIsMobile = loggingFunc('is-mobile');

      logger.debug(formatLEIsMobile('Checking phone number validity.'));

      if (this.isValid(phoneNumber, regionCode) !== true) {

        logger.debug(formatLEIsMobile('phoneNumber is not valid.'));
        var errMsg = 'PhoneNumber:' + phoneNumber + ' regionCode:' + regionCode + ' is not valid so mobile check cannot be performed.';
        logger.error(formatLEIsMobile(errMsg));

        throw (new Error(errMsg));
      } else {
        logger.debug(formatLEIsMobile('phoneNumber is valid.'));

        var pnType = pnExtractor.getType(phoneNumber, regionCode);

        var isPhoneNumMobile = (pnType === PhoneNumberType.MOBILE || pnType === PhoneNumberType.FIXED_LINE_OR_MOBILE);
        logger.debug(formatLEIsMobile('Result if phone is mobile: .' + isPhoneNumMobile));

        return isPhoneNumMobile;
      }
    }
  };
}

/**
 * This function returns another instance of Phone Number validator
 * @param options  that can contain a logger
 * @returns {PNValidator} new PNValidator object instance
 */
module.exports.createInstance = function createInstance(options) {
  return new PNValidator(getLogger(options));
};
