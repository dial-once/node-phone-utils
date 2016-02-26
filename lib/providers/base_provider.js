/**
 * A base class used for lookup provider forming and validation
 * @module providers/base_provider
 */


/**
 * Base HRL lookup provider, a reference for implementation of hlr lookup providers
 * @param {!string} name  the name of the provider, should be unique among providers
 * @param {!string} username username of the provider account
 * @param {!string} password username of the provider account
 * @constructor
 * @interface
 */

function BaseProvider(name, username, password) {

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

  this.name = name;
  this.username = username;
  this.password = password;
}

/**
 * Checks if th provider is valid or not. Provider must have hlrLookup function and be instanceof BaseProvider to be valid
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
  throw new Error('This function is a base definition and needs to be overriden by implementing classes');
};

module.exports = BaseProvider;
