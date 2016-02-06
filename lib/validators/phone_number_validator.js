/**
 * A phone number utilities validator module based on google phone number lib!
 * @module phone-number-validator
 */

var InputValidator = require('./input_validator');
var getLogger = require('../helpers/logger_options_parser').getLoggerFromOptions;
var PNExrtactor = require('../extractors/phone_number_extractor');
var libPhoneNumber = require('google-libphonenumber');
var phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
var PhoneNumberType = libPhoneNumber.PhoneNumberType;
var loggingFunc = require('../helpers/logger_message_formatter').getLoggerMessageFunc('phone-number-validator');

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

        var formatLEIsValid = loggingFunc('is-valid');

        logger.info(formatLEIsValid('Starting phoneNumber: ' + phoneNumber + ' regionCode: ' + regionCode));

        if (!InputValidator.isValidInput(phoneNumber, true)) {
          var err = new TypeError('Phone number: ' + phoneNumber + ' is not a valid input type (string or string array).');
          logger.error(formatLEIsValid(err.message));
          throw err;
        } else {

          return PNExrtactor
          .getInstance({logger: logger})
          .getGooglePhoneNumber(phoneNumber, regionCode)
          .then(function (gPhoneNum) {

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

      var formatLEIsMobile = loggingFunc('is-mobile');

      return this
      .isValid(phoneNumber, regionCode)
      .then(function checkValid(isValid) {

        logger.debug(formatLEIsMobile('Checking phone number validity.'));

        if (isValid !== true) {

          logger.debug(formatLEIsMobile('phoneNumber is not valid.'));
          var errMsg = 'PhoneNumber:' + phoneNumber + ' regionCode:' + regionCode + ' is not valid so mobile check cannot be performed.';
          logger.error(formatLEIsMobile(errMsg));

          return Promise.reject(new Error(errMsg));
        } else {
          logger.debug(formatLEIsMobile('phoneNumber is valid.'));
          var pnExtractor = PNExrtactor.getInstance({logger: logger});

          return pnExtractor
          .getGooglePhoneNumber(phoneNumber, regionCode)
          .then(pnExtractor.getType)
          .then(function (pnType) {
            var isPhoneNumMobile = (pnType === PhoneNumberType.MOBILE || pnType === PhoneNumberType.FIXED_LINE_OR_MOBILE);
            logger.debug(formatLEIsMobile('Result if phone is mobile: .' + isPhoneNumMobile));

            return Promise.resolve(isPhoneNumMobile);
          });
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
  return new PNValidator(getLogger(options));
};
