/**
 * A node phone number utilities module!
 * @module node-phone-utils
 * @example
 * var phoneNumbersUtils = require('node-phone-utils').createInstance();
 */

require('dotenv').config();
var _ = require('lodash');
var PNValidator = require('./validators/phone_number_validator');
var InputValidator = require('./validators/input_validator');
var PNExtractor = require('./extractors/phone_number_extractor');
var PNFormatter = require('./formatters/phone_number_formatter');

//hlr lookup providers
var SmsApiProvider = require('./providers/sms_api_provider');
var HlrLookupsProvider = require('./providers/hlr_lookups_provider');

/**
 * The main phone-number-utils class for manipulating phone numbers
 * @param [options] optional options object. The options.logger can contain a winston logger and is used for logging
 * @returns {{isValid: isValid, isMobile: isMobile, toE164: toE164, toNationalNumber: toNationalNumber, PhoneNumberType: *, getType: getType, getCountryCode: getCountryCode, getProviders: getProviders, hlrLookup: hlrLookup, getVersion: getVersion}}
 * @constructor
 */
var PhoneNumberUtils = function PhoneNumberUtils(options) {
  //phone number manipulators

  var pUtilsOptions = options || {};

  if (!_.isObject(pUtilsOptions) || _.isArray(pUtilsOptions)) {
    throw new Error('Supplied options object must be an object');
  }

  var pnValidator = PNValidator.createInstance(pUtilsOptions);
  var pnExtractor = PNExtractor.createInstance(pUtilsOptions);
  var pnFormatter = PNFormatter.createInstance(pUtilsOptions);


  return {
    /**
     *This function checks if an input phone numbers are valid or not.
     * @function
     * @public
     * @param numbers {!string|string[]} string or array of strings indicating E164 formatted phone number(s) to be validated.
     * @param [regionCode] {string} optional 2 letter region code string like 'FR' or 'UK'
     * @returns {boolean|Object[]} In case numbers is a string it returns a boolean indicating if the number is valid or not. Throws error in case of error.
     * In case numbers is an array the return value is an array (order not guaranteed) with objects {isValid: true|false, number: inputNumber}.
     * In case of error error is not thrown but another object is put in the array like {isError : true, err: [error Object]}.
     * @example
     * var phoneNumbersUtils = require('node-phone-utils').createInstance();
     *
     * phoneNumbersUtils.isValid('+3312344321') //=> true
     *
     * phoneNumbersUtils.isValid(['+3312344321', '+AB123456', '1ABC,!']) //=>
     *
     * [
     *   {
     *    isValid: true,
     *    number: "+3312344321"
     *   },
     *   {
     *    isValid: false,
     *    number: "+AB123456"
     *   },
     *   {
     *    isError: true,
     *    error: [error Object]
     *   },
     * ]
     * @throws {Error|TypeError} In case numbers is a string it throws errors that occurred in validation of input as well as in process of checking. In case numbers is a string array, error is thrown if numbers is empty array, otherwise an object {isError: true, error {Error}} is put into the returned array.
     */
    isValid: function isValid(numbers, regionCode) {
      return getProcessedResult(numbers, regionCode, 'isValid', pnValidator.isValid, pnValidator);
    },

    /**
     * This function checks if the phone number(s) are mobile or not.
     * @public
     * @function
     * @param numbers {!string|string[]} string or array of strings indicating E164 formatted phone number(s) to be checked.
     * @param [regionCode] {string} optional 2 letter region code string like 'FR' or 'UK'
     * @returns {boolean|Object[]} In case numbers is a string it returns a boolean indicating if the number is valid or not. Throws error in case of error.
     * In case numbers is an array the return value is an array (order not guaranteed) with objects {isValid: true|false, number: inputNumber}.
     * In case of error error is not thrown but another object is put in the array like {isError : true, err: [error Object]}.
     * @example
     * var phoneNumbersUtils = require('node-phone-utils').createInstance();
     *
     * phoneNumbersUtils.isMobile('+3312344321') //=> true
     *
     * phoneNumbersUtils.isMobile(['+3312344321', '+AB123456', '1ABC,!']) // =>
     *
     * [
     *   {
     *    isMobile: true,
     *    number: "+3312344321"
     *   },
     *  {
     *    isMobile: false,
     *    number: "+AB123456"
     *  },
     *  {
     *    isError: true,
     *    error: [error Object]
     *  },
     * ]
     * @throws {Error|TypeError} In case numbers is a string it throws errors that occurred in validation of input as well as in the process of checking. In case numbers is a string array, error is thrown if numbers is empty array otherwise an object {isError: true, error {Error}} is put into the returned array.
     */
    isMobile: function isMobile(numbers, regionCode) {
      return getProcessedResult(numbers, regionCode, 'isMobile', pnValidator.isMobile, pnValidator);
    },

    /**
     * This function converts phone number(s) to E164 format
     * @function
     * @public
     * @param numbers {!string|string[]} string or array of strings indicating phone number(s) to be formatted to e164 form.
     * @param [regionCode] {string} optional 2 letter region code string like 'FR' or 'UK'
     * @returns {string|Object[]} In case numbers is a string it returns a string representing a phone number in E164 format. Throws error otherwise.
     * In case numbers is an array the return value is an array (order not guaranteed) with objects {e164: "number", number: inputNumber}.
     * In case of error, error is not thrown but another object is put in the array like {isError : true, err: [error Object]}.
     * @example
     * var phoneNumbersUtils = require('node-phone-utils').createInstance();
     *
     * phoneNumbersUtils.toE164('33 123 44 321') //=> '+3312344321'
     *
     * phoneNumbersUtils.toE164(['33 123 44 321', '33 123 44 322', '1ABC,!']) //=>
     *
     * [
     *   {
     *    e164: "+3312344321"
     *    number: "33 123 44 321"
     *   },
     *   {
     *    e164: "+3312344322"
     *    number: "33 123 44 322"
     *   },
     *   {
     *    isError: true,
     *    error: [error Object]
     *   },
     * ]
     * @throws {Error|TypeError} In case numbers is a string it throws errors that occurred in processing of input. In case numbers is a string array, error is thrown if numbers is empty array, otherwise an object {isError: true, error {Error}} is put into the returned array.
     */
    toE164: function toE164(numbers, regionCode) {
      return getProcessedResult(numbers, regionCode, 'e164', pnFormatter.toE164, pnFormatter);
    },

    /**
     * This function converts phone number(s) to national numbers format
     * @public
     * @function
     * @param numbers {!string|string[]} string or array of strings indicating E164 formatted phone number(s) to be checked.
     * @param [regionCode] {string} optional 2 letter region code string like 'FR' or 'UK'
     * @returns {string|Object[]} In case numbers is a string it returns a string representing a phone number in national format. Throws error otherwise.
     * In case numbers is an array the return value is an array (order not guaranteed) with objects {nationalNumber: "number", number: inputNumber}.
     * In case of error, error is not thrown but another object is put in the array like {isError : true, err: [error Object]}.
     * @example
     * var phoneNumbersUtils = require('node-phone-utils').createInstance();
     *
     * phoneNumbersUtils.toNationalNumber('+33892696992') //=> '0 892 69 69 92'
     *
     * phoneNumbersUtils.toNationalNumber(['+33892696992', '+33969396949', '1ABC,!']) //=>
     * [
     *   {
     *     nationalNumber: "0 892 69 69 92"
     *     number: "+33892696992"
     *   },
     *   {
     *     nationalNumber: "09 69 39 69 49"
     *     number: "+33969396949"
     *   },
     *   {
     *     isError: true,
     *     error: [error Object]
     *   },
     * ]
     * @throws {Error|TypeError} In case numbers is a string it throws errors that occurred in processing of input. In case numbers is a string array, error is thrown if numbers is empty array, otherwise an object {isError: true, error {Error}} is put into the returned array.
     */
    toNationalNumber: function toNationalNumber(numbers, regionCode) {
      return getProcessedResult(numbers, regionCode, 'nationalNumber', pnFormatter.toNationalNumber, pnFormatter);
    },

    /**
     * Phone Number Type map useful for extracting human readable results from getType.
     * This is basically a passthrough of i18n.phonenumbers.PhoneNumberType
     * @typeDef {Object.<string, number>} PhoneNumberType
     * @public
     * @example
     * i18n.phonenumbers.PhoneNumberType = {
     *  FIXED_LINE: 0,
     *  MOBILE: 1,
     *   // In some regions (e.g. the USA), it is impossible to distinguish between
     *    // fixed-line and mobile numbers by looking at the phone number itself.
     *  FIXED_LINE_OR_MOBILE: 2,
     *  // Freephone lines
     *  TOLL_FREE: 3,
     *  PREMIUM_RATE: 4,
     *  // The cost of this call is shared between the caller and the recipient, and
     *  // is hence typically less than PREMIUM_RATE calls. See
     *  // http://en.wikipedia.org/wiki/Shared_Cost_Service for more information.
     *  SHARED_COST: 5,
     *  // Voice over IP numbers. This includes TSoIP (Telephony Service over IP).
     *  VOIP: 6,
     *  // A personal number is associated with a particular person, and may be routed
     *  // to either a MOBILE or FIXED_LINE number. Some more information can be found
     *  // here: http://en.wikipedia.org/wiki/Personal_Numbers
     *  PERSONAL_NUMBER: 7,
     *  PAGER: 8,
     *  // Used for 'Universal Access Numbers' or 'Company Numbers'. They may be
     *  // further routed to specific offices, but allow one number to be used for a
     *  // company.
     *  UAN: 9,
     *  // Used for 'Voice Mail Access Numbers'.
     *  VOICEMAIL: 10,
     *  // A phone number is of type UNKNOWN when it does not fit any of the known
     *  // patterns for a specific region.
     *  UNKNOWN: -1
     * };
     */
    PhoneNumberType: pnExtractor.PhoneNumberType,

    /**
     * This function gets the type of the phone number
     * @function
     * @public
     * @param numbers {!string|string[]} string or array of strings indicating E164 formatted phone numbers to be checked.
     * @param [regionCode] {string} optional 2 letter region code string like 'FR' or 'UK'
     * @returns {PhoneNumberType|Object[]} In case of single phone number (string) it phone number type value (one of {@link PhoneNumberType} values), error thrown otherwise. In case numbers is array then array of objects like {type: {number}, number:inputNumber} is returned. If one of entries in array caused an error, then and error object is put in that place of the returned array like {isError: true; error: [error Object]}.
     * @throws {Error|TypeError} In case numbers is a string it throws errors that occurred in processing of input and in case numbers is a string array, then error is thrown if numbers is empty array otherwise an object {isError: true, error {Error}} is put into the returned array.
     * @example
     * var phoneNumbersUtils = require('node-phone-utils').createInstance();
     *
     * phoneNumbersUtils.getType('+3312344321') // => 33
     *
     * phoneNumbersUtils.getType(['+3312344321', '+3312344322', '1ABC,!']) //=>
     *
     * [
     *   {
     *    type: 4,
     *    number: "+3312344321"
     *   },
     *   {
     *    type: 1,
     *    number: "+3312344322"
     *   },
     *   {
     *    isError: true,
     *    error: [error Object]
     *   },
     * ]
     */
    getType: function getType(numbers, regionCode) {
      return getProcessedResult(numbers, regionCode, 'type', pnExtractor.getType, pnExtractor);
    },

    /**
     * This function gets country codes from phone numbers
     * @function
     * @public
     * @param numbers {!string|string[]} string or array of strings indicating E164 formatted phone number(s) to be checked.
     * @param [regionCode] {string} optional 2 letter region code string like 'FR' or 'UK'
     * @returns {number|Object[]} In case of single phone number (string) returns a single country code or throws error otherwise. In case numbers is array then array of objects like {countryCode: {number}, number:inputNumber} is returned. If one of the entries in array caused an error, then and error object is put in that place of the returned array in the form od {isError: true; error: [error Object]}.
     * @throws {Error|TypeError} In case numbers is a string it throws errors that occurred in processing of input and in case numbers is a string array, then error is thrown if numbers is empty array otherwise an object {isError: true, error {Error}} is put into the returned array.
     * @example
     * var phoneNumbersUtils = require('node-phone-utils').createInstance();
     *
     * phoneNumbersUtils.getCountryCode('+3312344321') //=> 33
     *
     * phoneNumbersUtils.getCountryCode(['+3312344321', '+3312344322', '1ABC,!']) //=>
     *
     * [
     *   {
     *    countryCode: 33,
     *    number: "+3312344321"
     *   },
     *   {
     *    countryCode: 33,
     *    number: "+3312344322"
     *   },
     *   {
     *    isError: true,
     *    error: [error Object]
     *   },
     * ]
     */
    getCountryCode: function getCountryCode(numbers, regionCode) {
      return getProcessedResult(numbers, regionCode, 'countryCode', pnExtractor.getCountryCode, pnExtractor);
    },

    /**
     * Get built in HLR Lookups providers
     * @returns {{smsApi: (SMSAPILookupsProvider), hlrLookups: (HLRLookupsProvider)}}
     * @example
     * var phoneNumbersUtils = require('node-phone-utils').createInstance();
     * var smsApiProvider = phoneNumbersUtils.getProviders().smsApi;
     * var hlrLookupsProvider = phoneNumbersUtils.getProviders().hlrLookups;
     * // Do something with the providers.
     */
    getProviders: function getProviders() {
      return {
        smsApi: new SmsApiProvider('smsapi.com', process.env.SMSAPI_USERNAME, process.env.SMSAPI_HASHED_PASSWORD, pUtilsOptions.logger),
        hlrLookups: new HlrLookupsProvider('hlr-lookups.com', process.env.HLR_LOOKUPS_USERNAME, process.env.HLR_LOOKUPS_PASSWORD, pUtilsOptions.logger)
      };
    },

    /**
     * This function does an HLR lookup of an E164 phone number and returns the results
     * @function
     * @public
     * @param e164Number string or array of string indicating E164 phone numbers to be checked.
     * @param [provider] {Object}
     * @returns {Promise} HLR info if resolved and error if rejected.
     */
    hlrLookup: function hlrLookup(e164Number, provider) {
      var _provider = provider || pUtilsOptions.provider;
      if (!InputValidator.isValidHLRLookupProvider(_provider)) {
        return Promise.reject(new Error('Invalid HLR lookup provider supplied. Make sure it is an object with name property and a hlrLookup function.'));
      } else {
        return Promise.resolve(_provider.hlrLookup(e164Number));
      }
    },

    /**
     * The version of this library (sync call)
     * @public
     * @returns {string} Version of the library.
     */
    getVersion: function getVersion() {
      return require('../package.json').version;
    }

  };
};

/**
 * Main instantiation function that creates another PhoneNumberUtils object
 * @param [options] Optional options object where you can supply logger, provider options
 * @returns {PhoneNumberUtils} {@type PhoneNumberUtils}
 * @throws {Error} if something went wrong.
 */
module.exports.createInstance = function createInstance(options) {
  return new PhoneNumberUtils(options);
};

//helper functions
/**
 * @private
 * @param numbers {string|string[]} string or array of strings indicating E164 formatted phone number(s) to be validated.
 * @param regionCode {string} 2 letter region code string like 'FR' or 'UK'. Can be null or falsy.
 * @param arrayCaseObjPropName {string} name of the field that will be added to object in case numbers is array. Usually the result of type of the check e.g. isMobile, isValid, type...)
 * @param processingFunc function to process each number.
 * @param thisRef reference to this for processingFunc
 * @returns {*} the result of processingFunc if numbers is not array. if numbers is array then array of objects that contain the result of processingFunc in a arrayCaseObjPropName property and a field named number that is a passed in number or an error object in case of error {isError: true , error :[errorObject]}
 */
function getProcessedResult(numbers, regionCode, arrayCaseObjPropName, processingFunc, thisRef) {
  if (_.isArray(numbers) && !_.isEmpty(numbers)) {
    return _.map(numbers, function (number) {
      var result = {};
      try {
        result[arrayCaseObjPropName] = processingFunc.call(thisRef, number, regionCode);
        result.number = number;
      } catch (e) {
        result.isError = true;
        result.error = e;
      }
      return result;
    });
  } else {
    return processingFunc.call(thisRef, numbers, regionCode);
  }
}
