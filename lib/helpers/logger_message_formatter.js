
var format = require('util').format;
var LOG_PREFIX = '[phone-number-utils:%s:%s] %s';

module.exports.getLoggerMessageFunc = function formatLoggerMessage(moduleName){
  return function logFunction(funcName){
    return function loggMessage(msg) {
      return format(LOG_PREFIX, moduleName, funcName, msg);
    };
  };
};
