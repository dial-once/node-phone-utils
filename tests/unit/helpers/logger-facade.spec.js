/*jshint -W030 */
var chai = require('chai');
var _ = require('lodash');
var getLoggerFacade = require('../../../lib/logging/logger-facade');
var validateLogger = require('./common').validateLogger;

var winston = require('winston');
var winstonLogger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({level: 'error'})
  ]
});

var expect = chai.expect;

describe('Logging: Logger facade', function () {

  describe('getLoggerFacade', function () {

    it('should have getLoggerFacade function exposed', function () {
      expect(getLoggerFacade).to.be.a('function');
    });

    it('should return empty facade if invalid loggers were supplied', function () {
      _.each(['a', '', null, undefined, {}, 0, 55, true, false], function (item) {
        var loggerItem = getLoggerFacade(item);
        validateLogger(loggerItem);
        loggerItem.log('test');
        loggerItem.info('test');
        loggerItem.verbose('test');
        loggerItem.silly('test');
        loggerItem.warn('test');
        loggerItem.error('test');
      });
    });

    it('should return passed in logger with some needed methods if supplied', function () {
      var item = {
        log: function () {
        }
      };
      var loggerItem = getLoggerFacade(item);
      expect(loggerItem).to.deep.equal(item);
    });

    it('should return passed in winston logger', function () {
      var loggerItem = getLoggerFacade(winstonLogger);
      expect(loggerItem).to.deep.equal(winstonLogger);
      validateLogger(loggerItem);
    });

  });
});