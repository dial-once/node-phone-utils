/**
 * A simple input validator utility module!
 * @module input-validator
 * @private
 */

var InputValidator = {};
var _ = require('lodash');
var MIN_SHORT_NUMBER_LEN = 2;
var MAX_SHORT_NUMBER_LEN = 5;
// a short number is a number whose length is > 2 and < 5

// helpers
function isNotValidArg(arg) {
  return (typeof arg !== 'string') || arg.length === 0;
}

/**
 * Checks input to be non falsy and string
 * @private
 * @param input - input value to test
 * @param allowArray {boolean}  - allow the input to be an array of strings
 * @returns {boolean} - true if input is valid (non falsy string or array of strings if @param allowArray is true), false otherwise
 */
InputValidator.isValidInput = function isValidInput(input, allowArray) {

  var inputValid = false;
  if (input) {
    if (_.isString(input) && input.length > 0) {
      inputValid = true;
    } else if (allowArray && _.isArray(input) && input.length > 0) {
      _.each(input, function (inputItem) {
        inputValid = inputItem && _.isString(inputItem);
        if (inputValid === false) {
          return false;
        }
      });
    }
  }

  return inputValid;
};

/**
 * Checks if a phoneNumber' length is above 2 and less then < 5 and this number is then considered short and cannot be validated, checked for type and etc.
 * @public
 * @param phoneNumber {string} - a valid non empty string representing an e164 phone number.
 * @returns {boolean} true if number is considered short and false otherwise
 */
InputValidator.isShortNumber = function isShortNumber(phoneNumber) {
  return _.isString(phoneNumber) && phoneNumber.length > MIN_SHORT_NUMBER_LEN && phoneNumber.length < MAX_SHORT_NUMBER_LEN;
};

/**
 * Checks if provider is valid or not. A provider is considered to be valid if it's not nil, is object, has a valid name property and hlrLookup function.
 * @param provider {!object} HlrLookup provider
 * @returns {*|boolean} - True if valid false otherwise
 */
InputValidator.isValidHLRLookupProvider = function isValidHLRLookupProvider(provider) {
  return _.isObject(provider) && !_.isEmpty(provider) && !_.isEmpty(provider.name) && typeof provider.hlrLookup === 'function';
};

/**
 * Checks if a provider has a name, username and password set up as well as a hlrLookup function
 * @param provider {!object} HlrLookup provider
 * @param userName {!string} HlrLookup provider username
 * @param password {!string} HlrLookup provider password
 * @returns {*|boolean} - True if valid false otherwise
 * @throws Error if any of the properties (name, )
 */
InputValidator.validateProvider = function validateProvider(provider, userName, password) {

  if (!_.isObject(provider) || _.isEmpty(provider)) {
    throw new Error('Valid provider object must be specified');
  }

  if (isNotValidArg(provider.name)) {
    throw new Error('Name must be specified');
  }

  if (isNotValidArg(userName)) {
    throw new Error('Username must be specified');
  }

  if (isNotValidArg(password)) {
    throw new Error('Password must be specified');
  }

  if (typeof provider.hlrLookup !== 'function') {
    throw new Error('Provider must have a hlrLookup function');
  }

};

/**
 * Checks if cache is a non falsy object with set, get and del functions
 * @param {object} cache the cache being validated
 * @returns {boolean}
 */
InputValidator.isValidCache = function (cache) {
  if (_.isNil(cache)) return false;
  if (!_.isFunction(cache.set)) return false;
  if (!_.isFunction(cache.get)) return false;
  if (!_.isFunction(cache.del)) return false;

  return true;
};

/**
 * Validates options object for async hlr lookup (valid provider, cache, callback and paramaters)
 * @param {object} options to be validated
 * @throws {Error}
 */
InputValidator.validateAsyncLookupOptions = function validateAsyncLookupOptions(options) {
  if (!_.isObject(options) || _.isEmpty(options)) {
    throw new Error('Valid options object must be specified');
  }

  if (!InputValidator.isValidHLRLookupProvider(options.provider)) {
    throw new Error('Provider is not a valid hlrLookup provider');
  }

  if (!_.isFunction(options.provider.processResultReq)) {
    throw new Error('Provider must have processResultReq function');
  }

  if (!_.isFunction(options.provider.asyncHlrLookup)) {
    throw new Error('Provider must have asyncHlrLookup function');
  }

  if (!InputValidator.isValidCache(options.cache)) {
    throw new Error('Cache is not valid object with get, set and del functions');
  }

  if (options.resultCallback && !_.isFunction(options.resultCallback)) {
    throw new Error('resultCallback must be a function');
  }

  if (options.doneCallback && !_.isFunction(options.doneCallback)) {
    throw new Error('doneCallback must be a function');
  }

  if (options.callbackUrl && !_.isString(options.callbackUrl)) {
    throw new Error('callbackUrl must be a string');
  }

  if (!_.isString(options.callbackIdQSParam) || options.callbackIdQSParam.length === 0) {
    throw new Error('callbackIdQSParam must be a non empty string');
  }

  if (options.middlewareSend && ! _.isBoolean(options.middlewareSend)) {
    throw new Error('middlewareSend must be a boolean');
  }

  if (!_.isNumber(options.lookupTimeout) || options.lookupTimeout < 1 || !_.isFinite(options.lookupTimeout)) {
    throw new Error('lookupTimeout must be a valid positive finite number');
  }
};

module.exports = InputValidator;
