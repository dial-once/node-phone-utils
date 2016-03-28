/**
 * A simple module that gets a logger from options
 * @module logger-options-parser
 * @private
 */
var getLoggerFacade = require('./logger-facade');
var defaultLogger = getLoggerFacade({});

/**
 * Gets a logger object from options or a dummy logger facade if non or empty options.logger
 * @param options {object} options to parse
 * @returns {object} passed in logger from options.logger or noop logger facade : logger{{info, log, warn, error, verbose, debug, silly}}
 */
module.exports.getLoggerFromOptions = function getLoggerFromOptions (options) {
  return options && options.logger ? getLoggerFacade(options.logger) : defaultLogger;
};
