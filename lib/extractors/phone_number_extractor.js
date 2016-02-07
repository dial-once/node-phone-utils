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
     * @returns {Promise} - Resolves to a google phone number object or rejects with error
     */
    getGooglePhoneNumber: function getGooglePhoneNumber(phoneNumber, regionCode) {

      return new Promise(function (resolve, reject) {
        var logMessageFmt = loggingFunc('get-google-phone-number');

        var gPhoneNum;

        try {
          if (regionCode && typeof  regionCode === 'string' && regionCode.length > 0) {
            logger && logger.debug(logMessageFmt('Got valid regionCode so progressing with it'));
            // this method is faster if we have region code;
            gPhoneNum = phoneUtil.parse(phoneNumber, regionCode);
          } else {
            logger && logger.debug(logMessageFmt('Parsing phoneNumber without valid region code'));
            gPhoneNum = phoneUtil.parse(phoneNumber);
          }
        } catch (e) {
          var msg =  'Error while parsing phoneNumber ' + phoneNumber + ' regionCode: ' + regionCode + '.';
          e.message = msg + ' ' + e.message;
          logger && logger.error(logMessageFmt(msg));
          return reject(e);
        }

        return resolve(gPhoneNum);
      });
    },

    /**
     * Function that gets the type of a googlePhoneNumber
     * @param gPhoneNumber - google phone number object;
     * @returns {Promise} - Resolved to one of PhoneNumberTypes or rejects with err;
     */
    getType: function getType(gPhoneNumber) {
      return new Promise(function (resolve, reject) {

        var loggMessage = loggingFunc('get-type');
        logger.info(loggMessage('Calling get-type googlePhoneNumber:' + gPhoneNumber));

        if (gPhoneNumber) {
          var type = phoneUtil.getNumberType(gPhoneNumber);
          logger.info(loggMessage('Number type is' + type));
          return resolve(type);
        } else {
          var err = new Error('No or Invalid gPhoneNumber supplied');
          logger.err(loggMessage(err.message));
          return reject(err);
        }
      });
    }
  };
};

module.exports.getInstance = function getInstance(options) {
  return new PNExtractor(getLogger(options));
};
