/**
 * A phone number utilities validator module based on google phone number lib used to format phone numbers
 * @module phone-number-formatter
 */

var _ = require('lodash');
var getLogger = require('../helpers/logger_options_parser').getLoggerFromOptions;
var PNExtractor = require('../extractors/phone_number_extractor');
var libPhoneNumber = require('google-libphonenumber');
var phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
var PhoneNumberFormat = libPhoneNumber.PhoneNumberFormat;
var PhoneNumberFormatValues = _.values(PhoneNumberFormat);
var InvertedPhoneNumberFormat = _.invert(PhoneNumberFormat);
var loggingFunc = require('../helpers/logger_message_formatter').getLoggerMessageFunc('phone-number-formatter');

/**
 * Phone number formatter utility class
 * @param logger - the optional or facaded logger to be used
 * @returns {{toE164, toNationalNumber}}
 * @constructor
 */
function PNFormatter(logger) {

  var getGooglePhoneNumber = PNExtractor.getInstance({logger: logger}).getGooglePhoneNumber;

  /**
   *
   * @param formatType - on of PhoneNumberFormat values
   * @returns {formatPhoneNumberInternal} - function that takes a phoneNumber and an optional regionCode
   */
  var formatPhoneNumber = function formatPhoneNumber(formatType) {

    var logEntryFunc = loggingFunc('format-phone-number');

    if (!_.includes(PhoneNumberFormatValues, formatType)) {
      var msg = 'formatType: ' + formatType + ' is not one of the accepted values: ' + formatType;
      logger.error(logEntryFunc(msg));
      throw new Error(msg);
    } else {
      var formatTypeDescription = InvertedPhoneNumberFormat[formatType];
      logger.debug(logEntryFunc('Proceeding with correct number format type: ' + formatTypeDescription));

      return function formatPhoneNumberInternal(phoneNumber, regionCode) {

        var formatLE = loggingFunc('format-phone-number-internal');

        logger.debug(formatLE('formatting phoneNumber: ' + phoneNumber + ' to type' + formatType + '[' + formatTypeDescription + '] regionCode:' + regionCode));

        var gPhoneNumber = getGooglePhoneNumber(phoneNumber, regionCode);
        var fmtPhoneNumber = phoneUtil.format(gPhoneNumber, formatType);
        logger.info(formatLE('formatted phone number: ' + fmtPhoneNumber));
        return fmtPhoneNumber;
      };
    }
  };

  return {
    toE164: formatPhoneNumber(PhoneNumberFormat.E164),
    toNationalNumber: formatPhoneNumber(PhoneNumberFormat.NATIONAL)
  };
}

/**
 * This function returns another instance of Phone Number validator
 * @param options - options that can contain a logger
 * @returns {PNFormatter} - new PNValidator object instance
 */
module.exports.getInstance = function getInstance(options) {
  return new PNFormatter(getLogger(options));
};
