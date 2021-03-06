/**
 * Logger facade helper module
 * @module logger-facade
 * @private
 */
var _  = require('lodash');

/**
 * This function returns a logging facade to be used internally for logging
 * @param logger - the logger object to be examined
 * @returns {*} - A facade with logging methods that do nothing (info, log, warn, error, verbose, debug, silly) if logger is nothing or empty or the logger object itself if it is a logger module.
 */
module.exports = function getLoggerFacade(logger){
  if (!logger || _.isEmpty(logger) || !_.isObject(logger)) {
    //simple noops
    return {
      info : function(){},
      log: function(){},
      warn: function(){},
      error: function(){},
      verbose: function(){},
      debug: function(){},
      silly: function(){}
    };
  } else {
      return logger;
  }
};
