var _  = require('lodash');

/**
 *  This function returns a logging facade to be used internally for logging
 * @param logger - the logger object to be examined
 * @returns {*} - A facade with logging methods that do nothing (info, log, warn, error, verbose, debug, silly) if logger is nothing or empty or the logger object itself if it is a logger module.
 */
module.exports.getLoggerFacade = function getLoggerFacade(logger){
  if (!logger || _.isEmpty(logger)) {
    //simple noops
    return {
      info : function(){},
      log: function(){},
      warn: function(){},
      error: function(){},
      verbose: function(){},
      debug: function(){},
      fatal: function(){},
      silly: function(){}
    };
  } else {
      return logger;
  }
};
