/**
 * A phone number utilities extractor module based on google phone number lib!
 * @module phone-number-extractor
 * @private
 */

var _ = require('lodash');
var getLogger = require('../helpers/logger_options_parser').getLoggerFromOptions;
var libPhoneNumber = require('google-libphonenumber');
var phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
var PhoneNumberType = libPhoneNumber.PhoneNumberType;
var loggingFunc = require('../helpers/logger_message_formatter').getLoggerMessageFunc('phone-number-extractor');

/**
 * Phone number extractor class
 * @private
 * @param logger - a non optional (or facaded) logger;
 * @returns {{PhoneNumberType: *, getGooglePhoneNumber: getGooglePhoneNumber, getType: getType, getCountryCode: getCountryCode}}
 * @constructor
 */
var PNExtractor = function PNExtractor(logger) {

  return {

    /**
     * Gets a google phone number type
     */
    PhoneNumberType: _.cloneDeep(PhoneNumberType),

    /**
     * Function to get a Google Phone number from @param phoneNumber
     * @param phoneNumber - phoneNumber to parse
     * @param regionCode - regionCode of phone number
     * @returns {Object} - google phone number object or throws with error
     * @throws {Error} if number is not a valid e164 phone number, null, undefined or parsable
     */
    getGooglePhoneNumber: function getGooglePhoneNumber(phoneNumber, regionCode) {

      var logMessageFmt = loggingFunc('get-google-phone-number');

      var gPhoneNum;

      try {
        if (regionCode && typeof  regionCode === 'string' && regionCode.length > 0) {
          logger.info(logMessageFmt('Got valid regionCode so progressing with it'));
          // this method is faster if we have region code;
          gPhoneNum = phoneUtil.parse(phoneNumber, regionCode);
        } else {
          logger.info(logMessageFmt('Parsing phoneNumber without valid region code'));
          gPhoneNum = phoneUtil.parse(phoneNumber);
        }
      } catch (e) {
        var msg = 'Error while parsing phoneNumber ' + phoneNumber + ' regionCode: ' + regionCode + '.';
        e.message = msg + ' ' + e.message;
        logger.error(logMessageFmt(msg));
        throw e;
      }

      return gPhoneNum;

    },

    /**
     * Function that gets the type of a string number
     * @param number {string} - string number;
     * @param [regionCode] {string} - option al 2 letter region code;
     * @returns {Number} - one of PhoneNumberTypes or throws err;
     * @throws {Error} if number is not a valid e164 phone number, null, undefined or parsable
     */
    getType: function getType(number, regionCode) {

      var loggMessage = loggingFunc('get-type');
      logger.info(loggMessage('Calling get-type for phone number :' + number, ' regionCode: ' + regionCode));

      var gPhoneNumber = this.getGooglePhoneNumber(number, regionCode);
      var type = phoneUtil.getNumberType(gPhoneNumber);
      logger.info(loggMessage('Number type is' + type));
      return type;

    },

    /**
     * This function gets a countryCode from a string number (e164 formatted)
     * @function
     * @param number {string} phone number representation
     * @returns {string} country code or throws error if it cannot be found
     * @throws {Error} if number is not a valid e164 phone number, null, undefined or parsable
     */
    getCountryCode: function getCountryCode(number) {

      var logMsg = loggingFunc('get-country-code');
      logger.debug(logMsg('getting country code for: ' + number));

      var gPhoneNumber = this.getGooglePhoneNumber(number);
      var cCode = gPhoneNumber.getCountryCode();
      logger.info(logMsg('Country code: ' + cCode));
      return cCode;
    }
  };
};

/**
 * Gets a new instance of Phone number extractor utility based on supplied options
 * @param options - (options) an options object
 * @returns {PNExtractor} - new instance of phone number extractor
 */
module.exports.createInstance = function createInstance(options) {
  return new PNExtractor(getLogger(options));
};
