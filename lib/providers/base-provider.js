/**
 * A base class used for HLR lookup provider forming, common items and validation
 * @module providers/base_provider
 */

require('dotenv');
var PhoneNumberValidator = require('../validators/phone-number-validator');
var HLRResultExtractor = require('../extractors/hlr-result-extractor');
var getLogger = require('../logging/logger-options-parser').getLoggerFromOptions;
/**
 * Base HLR lookup provider, a reference interface for implementation of hlr lookup providers
 * @param {!string} name  the name of the provider, should be unique among providers
 * @param {!string} username username of the provider account
 * @param {!string} password username of the provider account
 * @param [logger] {!Object} optional logger instance
 * @constructor
 * @interface
 */

function BaseProvider(name, username, password, logger) {

  var isNotValidArg = function isNotValidArg (arg) {
    return (typeof arg !== 'string') || name.length === 0;
  };
  if (isNotValidArg(name)) {
    throw new Error('Name must be specified');
  }

  if (isNotValidArg(username)) {
    throw new Error('Username must be specified');
  }

  if (isNotValidArg(password)) {
    throw new Error('Password must be specified');
  }

  this.logger = getLogger({logger: logger});
  this.name = name;
  this.username = username;
  this.password = password;
  this.isProviderEnabled = (process.env.ENABLE_HLR_LOOKUPS === 'true');
  this.validator = PhoneNumberValidator.createInstance({logger: logger});
  this.hlrExtractor = HLRResultExtractor.createInstance({logger: logger});
}

/**
 * Checks if the provider is valid or not. Provider must have hlrLookup function and be instanceof BaseProvider to be valid
 * @returns {boolean}
 */
BaseProvider.prototype.isValid = function isValid() {
  return typeof this.hlrLookup === 'function' &&  this instanceof BaseProvider;
};

/**
 * Dummy function to be overridden by implementations of this prototype
 */
BaseProvider.prototype.hlrLookup = function hlrLookup() {
  //dummy function to be overridden by implementations;
  throw new Error('This function is a base definition and needs to be overridden by implementing classes');
};

module.exports = BaseProvider;
