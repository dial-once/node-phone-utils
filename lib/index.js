/**
 * A phone number utilities module!
 * @module phone-numer-utils
 */


module.exports = {
  /**
   *This function checks if an input phone numbers are valid or not.
   * @function
   * @param phoneNumber - string or array of string indicating phonenumbers to be validated.
   * @param countryCode - optional, a 2 letter country code
   * @returns {Promise} If resolved returns array of boolean values indicating true if number is valid and false if not. Error if rejected.
   */
  isValid: function isValid(phoneNumber, countryCode) {
    return new Promise(function isValidPromise(resolve, reject) {
      return resolve([true]);
    });
  },

  /**
   * This function checks if the phone numbers are mobile or not.
   * @function
   * @param phoneNumber - string or array of string indicating phone numbers to be checked.
   * @param countryCode - optional, a 2 letter country code
   * @returns {Promise} If resolved returns array of boolean values indicating true if number is moble and false if not. Error if rejected.
   */
  isMobile: function isMobile(phoneNumber, countryCode) {
    return new Promise(function isMobilePromise(resolve, reject) {
      return resolve([true]);
    });
  },

  /**
   * This function converts phone number(s) to E164 format
   * @function
   * @param phoneNumber - string or array of string indicating phone numbers to be converted.
   * @param countryCode - optional, a 2 letter country code
   * @returns {Promise} If resolved returns array of converted numbers, rejected if error.
   */
  toE164: function toE164(phoneNumber, countryCode) {
    return new Promise(function toE164Promise(resolve, reject) {
      return resolve([phoneNumber]);
    });
  },

  /**
   * This function converts phone number(s) to national numbers
   * @function
   * @param phoneNumber - string or array of string indicating phone numbers to be converted.
   * @param countryCode - optional, a 2 letter country code
   * @returns {Promise} If resolved returns array of converted numbers, rejected if error.
   */
  toNationalNumber: function toNationalNumber(phoneNumber, countryCode) {
    return new Promise(function toNationalNumberPromise(resolve, reject) {
      return resolve([phoneNumber]);
    });
  },

  /**
   * This function gets the type of the phone number(s)
   * @function
   * @param phoneNumber - string or array of string indicating phone numbers to be checked.
   * @param countryCode - optional, a 2 letter country code
   * @returns {Promise} If resolved returns array of number types, rejected if error.
   */
  getType: function getType(phoneNumber, countryCode) {
    return new Promise(function getTypePromise(resolve, reject) {
      return resolve([phoneNumber]);
    });
  },

  /**
   * This function gets country code from a phone number
   * @function
   * @param phoneNumber - string or array of string indicating phone numbers to be checked.
   * @returns {Promise} - returns a 2 letter country code string or error if failure
   */
  getCountryCode: function getCountryCode(phoneNumber) {
    return new Promise(function getCountryCodePromise(resolve, reject) {
      return resolve([phoneNumber]);
    });
  },

  /**
   * This function does an HLR lookup of an e164 phone number abd resturns the reuslts
   * @function
   * @param e164Number - string or array of string indicating E164 phone numbers to be checked.
   * @returns {Promise} - HLR info if sucessfull and error if failure.
   */
  hlrLookup: function hlrLookup(e164Number) {
    return new Promise(function hlrLookupPromise(resolve, reject) {
      return resolve([e164Number]);
    });
  }

};

