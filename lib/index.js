/**
 * A phone number utilities module!
 * @module phone-number-utils
 */

var PNValidator = require('./validators/phone_number_validator');
var pUtilsOptions = {};
var pValidator = PNValidator.getInstance() ;

module.exports = {

  /**
   * This function initializes the configuration options for the module
   * @function
   * @param options - (optional) options object. the options.logger can contain a winston logger and is used for logging then, otherwise ignored
   * @returns {object} - the phone-numbers-utl lib object
   */
  initConfig: function initConfig(options) {
    //TODO define and validate options and document also
    pUtilsOptions = options || {};
    pValidator = PNValidator.getInstance(pUtilsOptions);
    return this;
  },
  /**
   *This function checks if an input phone numbers are valid or not.
   * @function
   * @param phoneNumber - string or array of string indicating E164 formatted phone numbers to be validated.
   * @param regionCode - optional, a 2 letter region code string like 'FR' or 'UK'
   * @returns {Promise} - if resolved returns array of boolean values indicating true if number is valid and false if not. Error if rejected.
   */
  isValid: function isValid(phoneNumber, regionCode) {
    return pValidator.isValid(phoneNumber, regionCode);
  },

  /**
   * This function checks if the phone numbers are mobile or not.
   * @function
   * @param phoneNumber - string or array of string indicating E164 formatted phone numbers to be checked.
   * @param regionCode - optional, a 2 letter region code string like 'FR' or 'UK'
   * @returns {Promise} - if resolved returns array of boolean values indicating true if number is moble and false if not. Error if rejected.
   */
  isMobile: function isMobile(phoneNumber, regionCode) {
    return new Promise(function isMobilePromise(resolve, reject) {
      return resolve([true]);
    });
  },

  /**
   * This function converts phone number(s) to E164 format
   * @function
   * @param phoneNumber - string or array of string indicating phone numbers to be converted.
   * @param regionCode - optional, a 2 letter region code string like 'FR' or 'UK'
   * @returns {Promise}  - if resolved returns array of converted numbers, rejected if error.
   */
  toE164: function toE164(phoneNumber, regionCode) {
    return new Promise(function toE164Promise(resolve, reject) {
      return resolve([phoneNumber]);
    });
  },

  /**
   * This function converts phone number(s) to national numbers
   * @function
   * @param phoneNumber - string or array of string indicating E164 formatted phone numbers to be converted.
   * @param regionCode - optional, a 2 letter region code string like 'FR' or 'UK'
   * @returns {Promise} - if resolved returns array of converted numbers, rejected if error.
   */
  toNationalNumber: function toNationalNumber(phoneNumber, regionCode) {
    return new Promise(function toNationalNumberPromise(resolve, reject) {
      return resolve([phoneNumber]);
    });
  },

  /**
   * This function gets the type of the phone number(s)
   * @function
   * @param phoneNumber - string or array of string indicating E164 formatted phone numbers to be checked for type.
   * @param regionCode - optional, a 2 letter region code string like 'FR' or 'UK'
   * @returns {Promise} - if resolved returns array of number types, rejected if error.
   */
  getType: function getType(phoneNumber, regionCode) {
    return new Promise(function getTypePromise(resolve, reject) {
      return resolve([phoneNumber]);
    });
  },

  /**
   * This function gets country code from a phone number
   * @function
   * @param phoneNumber - string or array of string indicating E164 formatted phone numbers to be checked.
   * @returns {Promise} - returns a country code string or error if failure
   */
  getCountryCode: function getCountryCode(phoneNumber) {
    return new Promise(function getCountryCodePromise(resolve, reject) {
      return resolve([phoneNumber]);
    });
  },

  /**
   * This function does an HLR lookup of an e164 phone number abd returns the results
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

