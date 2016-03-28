/**
 * A phone number utilities validator module based on google phone number lib used to format phone numbers
 * @private
 * @module phone-number-formatter
 */

var _ = require('lodash');
var getLogger = require('../helpers/logger-options-parser').getLoggerFromOptions;
var PNExtractor = require('../extractors/phone-number-extractor');
var libPhoneNumber = require('google-libphonenumber');
var phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
var PhoneNumberFormat = libPhoneNumber.PhoneNumberFormat;
var PhoneNumberFormatValues = _.values(PhoneNumberFormat);
var InvertedPhoneNumberFormat = _.invert(PhoneNumberFormat);
var loggingFunc = require('../helpers/logger-message-formatter').getLoggerMessageFunc('phone-number-formatter');

/**
 * Phone number formatter utility class
 * @private
 * @param logger - the optional or facaded logger to be used
 * @returns {{toE164, toNationalNumber, toCustomFormat}}
 * @constructor
 */
function PNFormatter(logger) {

  var getGooglePhoneNumber = PNExtractor.createInstance({logger: logger}).getGooglePhoneNumber;

  /**
   * @private
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
      return function formatPhoneNumberInternal(phoneNumber, regionCode) {

        var formatLE = loggingFunc('format-phone-number-internal');

        logger.info(formatLE('formatting phoneNumber: ' + phoneNumber + ' to type' + formatType + '[' + formatTypeDescription + '] regionCode:' + regionCode));

        var gPhoneNumber = getGooglePhoneNumber(phoneNumber, regionCode);
        var fmtPhoneNumber = phoneUtil.format(gPhoneNumber, formatType);
        logger.info(formatLE('formatted phone number: ' + fmtPhoneNumber));
        return fmtPhoneNumber;
      };
    }
  };

  return {
    toE164: formatPhoneNumber(PhoneNumberFormat.E164),
    toNationalNumber: formatPhoneNumber(PhoneNumberFormat.NATIONAL),
    toCustomFormat: function (phoneNumber, formatType, regionCode) {
      return formatPhoneNumber(formatType)(phoneNumber, regionCode);
    }
  };
}

/**
 * This function returns another instance of Phone Number validator
 * @private
 * @param options - options that can contain a logger
 * @returns {PNFormatter} - new PNValidator object instance
 */
module.exports.createInstance = function createInstance(options) {
  return new PNFormatter(getLogger(options));
};
