/**
 * A simple module that gets a logger from options
 * @module 'logger-options.parser'
 */
var loggerFacade = require('./logger_facade');
var defaultLogger = loggerFacade.getLoggerFacade({});

/**
 * Gets a logger object from options or a dummy logger facade if non or empty options.logger
 * @param options - options to parse
 * @returns {object} -  passed in logger from options.logger or noop logger facade : logger{{info, log, warn, error, verbose, debug, silly}}
 */
module.exports.getLoggerFromOptions = function getLoggerFromOptions (options) {
  return options && options.logger ? loggerFacade.getLoggerFacade(options.logger) : defaultLogger;
};
