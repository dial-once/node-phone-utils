/**
 * A phone number utilities module!
 * @module phone-number-utils
 */

var PNValidator = require('./validators/phone_number_validator');
var PNExtractor = require('./extractors/phone_number_extractor');
var PNFormatter = require('./formatters/phone_number_formatter');
var pUtilsOptions = {};
var pnValidator = PNValidator.getInstance();
var pnExtractor = PNExtractor.getInstance();
var pnFormatter = PNFormatter.getInstance();

module.exports = {

  /**
   * This function initializes the configuration options for the module. CAll to this function is optional and can be ommited if you do not wish to set up any options (logging configuration)
   * @function
   * @param options - (optional) options object. the options.logger can contain a winston logger and is used for logging then, otherwise ignored
   * @returns {object} - the phone-numbers-util lib object
   */
  initConfig: function initConfig(options) {
    //TODO define and validate options and document also
    pUtilsOptions = options || {};
    pnValidator = PNValidator.getInstance(pUtilsOptions);
    pnExtractor = PNExtractor.getInstance(pUtilsOptions);
    pnFormatter = PNFormatter.getInstance(pUtilsOptions);
    return this;
  },
  /**
   *This function checks if an input phone numbers are valid or not.
   * @function
   * @param phoneNumber - string or array of string indicating E164 formatted phone numbers to be validated.
   * @param regionCode - optional, a 2 letter region code string like 'FR' or 'UK'
   * @returns {Boolean} - array of boolean values indicating true if number is valid and false if not. Error thrown in error conditions.
   */
  isValid: function isValid(phoneNumber, regionCode) {
    return pnValidator.isValid(phoneNumber, regionCode);
  },

  /**
   * This function checks if the phone numbers are mobile or not.
   * @function
   * @param phoneNumber - string or array of string indicating E164 formatted phone numbers to be checked.
   * @param regionCode - optional, a 2 letter region code string like 'FR' or 'UK'
   * @returns {Boolean} - array of boolean values indicating true if number is mobile and false if not. Throws Error.
   */
  isMobile: function isMobile(phoneNumber, regionCode) {
    return pnValidator.isMobile(phoneNumber, regionCode);
  },

  /**
   * This function converts phone number(s) to E164 format
   * @function
   * @param phoneNumber - string or array of string indicating phone numbers to be converted.
   * @param regionCode - optional, a 2 letter region code string like 'FR' or 'UK'
   * @returns {String}  - e164 formatted number. Throws error.
   */
  toE164: function toE164(phoneNumber, regionCode) {
    return pnFormatter.toE164(phoneNumber, regionCode);
  },

  /**
   * This function converts phone number(s) to national numbers
   * @function
   * @param phoneNumber - string or array of string indicating E164 formatted phone numbers to be converted.
   * @param regionCode - optional, a 2 letter region code string like 'FR' or 'UK'
   * @returns {String} -  formatted to national number. Throws error.
   */
  toNationalNumber: function toNationalNumber(phoneNumber, regionCode) {
    return pnFormatter.toNationalNumber(phoneNumber, regionCode);
  },

  /**
   * Phone number Type map useful for extracting human readable results from getType
   */
  PhoneNumberType: pnExtractor.PhoneNumberType,

  /**
   * This function gets the type of the phone number
   * @function
   * @param phoneNumber - string indicating E164 formatted phone number to be checked for type.
   * @param regionCode - (optional) a 2 letter region code string like 'FR' or 'UK'
   * @returns {Number} - phone number type (one of PhoneNumberTypes), rejected if error.
   */
  getType: function getType(phoneNumber, regionCode) {
    var gPhoneNumber = pnExtractor.getGooglePhoneNumber(phoneNumber, regionCode);
    return pnExtractor.getType(gPhoneNumber);
  },

  /**
   * This function gets country code from a phone number
   * @function
   * @param phoneNumber - string or array of string indicating E164 formatted phone numbers to be checked.
   * @returns {String} - returns a country code string or error if failure
   */
  getCountryCode: function getCountryCode(phoneNumber) {
    var gPhoneNumber = pnExtractor.getGooglePhoneNumber(phoneNumber);
    return pnExtractor.getCountryCode(gPhoneNumber);
  },

  /**
   * This function does an HLR lookup of an e164 phone number and returns the results
   * @function
   * @param e164Number - string or array of string indicating E164 phone numbers to be checked.
   * @returns {Promise} - HLR info if successful and error if failure.
   */
  hlrLookup: function hlrLookup(e164Number) {
    return new Promise(function hlrLookupPromise(resolve, reject) {
      return resolve([e164Number]);
    });
  }

};

