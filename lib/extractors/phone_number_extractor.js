/**
 * A phone number utilities extractor module based on google phone number lib!
 * @module phone-number-extractor
 */

var _ = require('lodash');
var getLogger = require('../helpers/logger_options_parser').getLoggerFromOptions;
var libPhoneNumber = require('google-libphonenumber');
var phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
var PhoneNumberType = libPhoneNumber.PhoneNumberType;
var loggingFunc = require('../helpers/logger_message_formatter').getLoggerMessageFunc('phone-number-extractor');

/**
 * Phone number extractor class
 * @param logger - a non optional (or facaded) logger;
 * @returns {{PhoneNumberType: *, getGooglePhoneNumber: getGooglePhoneNumber, getType: getType, getCountryCode: getCountryCode}}
 * @constructor
 */
var PNExtractor = function (logger) {
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
     */
    getGooglePhoneNumber: function getGooglePhoneNumber(phoneNumber, regionCode) {

      var logMessageFmt = loggingFunc('get-google-phone-number');

      var gPhoneNum;

      try {
        if (regionCode && typeof  regionCode === 'string' && regionCode.length > 0) {
          logger.debug(logMessageFmt('Got valid regionCode so progressing with it'));
          // this method is faster if we have region code;
          gPhoneNum = phoneUtil.parse(phoneNumber, regionCode);
        } else {
          logger.debug(logMessageFmt('Parsing phoneNumber without valid region code'));
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
     * Function that gets the type of a googlePhoneNumber
     * @param gPhoneNumber - google phone number object;
     * @returns {Number} -  one of PhoneNumberTypes or throws err;
     */
    getType: function getType(gPhoneNumber) {

      var loggMessage = loggingFunc('get-type');
      logger.info(loggMessage('Calling get-type googlePhoneNumber:' + gPhoneNumber));

      if (gPhoneNumber) {
        var type = phoneUtil.getNumberType(gPhoneNumber);
        logger.info(loggMessage('Number type is' + type));
        return type;
      } else {
        var err = new Error('No or Invalid gPhoneNumber supplied');
        logger.error(loggMessage(err.message));
        throw err;
      }

    },

    /**
     * This function gets a countryCode from googlePhoneNumber
     * @function
     * @param gPhoneNumber
     * @returns {Promise} - Resolves to a country code or rejects with err;
     */
    getCountryCode: function getCountryCode(gPhoneNumber) {

      var logMsg = loggingFunc('get-country-code');
      logger.debug(logMsg('Calling get-country-code for: ' + gPhoneNumber));

      if (gPhoneNumber) {
        var cCode = gPhoneNumber.getCountryCodeOrDefault();
        logger.info(logMsg('Country code is' + cCode));
        return cCode;
      } else {
        var err = new Error('None or invalid gPhoneNumber supplied');
        logger.error(logMsg(err.message));
        throw err;
      }
    }
  };
};

/**
 * Gets a new instance of Phone number extractor utility based on supplied options
 * @param options - (options) an options object
 * @returns {PNExtractor}
 */
module.exports.getInstance = function getInstance(options) {
  return new PNExtractor(getLogger(options));
};
