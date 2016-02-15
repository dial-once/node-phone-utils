/**
 * A module for simple formatting of a log entry in this format: '[library-name:module-name:function-name] message'
 * @module logger-number-formatter
 * @private
 */
var format = require('util').format;
var LOG_PREFIX = '[phone-number-utils:%s:%s] %s';

//helper function
var validateStringParam = function validateStringParam(param) {
  if (!(param && typeof  param === 'string' && param.length > '0')) {
    throw new Error('Parameter: ' + param + ' is not a valid string');
  } else {
    return true;
  }
};

/**
 * Main method that takes a module name and returns a function for logging at function level. Throws error.
 * @private
 * @param moduleName - nonempty string designating a module name.
 * @returns {logFunction} - a function that takes in the name of function being executed for logging purposes
 */
module.exports.getLoggerMessageFunc = function formatLoggerMessage(moduleName) {
  if (validateStringParam(moduleName)) {

    return function logFunction(funcName) {

      if (validateStringParam(funcName)) {
        return function loggMessage(msg) {
          return format(LOG_PREFIX, moduleName, funcName, msg || '');
        };
      }

    };
  }

};
