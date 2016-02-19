/**
 * Base HRL lookup provider, a reference for implementation of hlr lookup providers
 * @param name {!string} the name of the provider, should be unique among providers
 * @param username {!string} username of the provider account
 * @param password {!password} username of the provider account
 * @constructor
 */

function BaseProvider(name, username, password) {

  var isString = function isString (arg) {
    return typeof arg === 'string';
  };
  if (!isString(name) || name.length === 0) {
    throw new Error('Name must be specified');
  }

  if (!isString(username) || username.length === 0) {
    throw new Error('Username must be specified');
  }

  if (!isString(password) || password.length === 0) {
    throw new Error('password must be specified');
  }

  this.name = name;
  this.username = username;
  this.password = password;
}

/**
 * Checks if th provider is valid or not
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
};

module.exports = BaseProvider;
