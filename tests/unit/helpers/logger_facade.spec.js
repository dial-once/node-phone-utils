/*jshint -W030 */
var chai = require('chai');
var _ = require('lodash');
var facade = require('../../../lib/helpers/logger_facade');
var validateLogger = require('./common').validateLogger;

var winston = require('winston');
var winstonLogger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({level: 'silly'})
  ]
});

var expect = chai.expect;

describe('Helpers: Logger facade', function () {

  describe('getLoggerFacade', function () {

    it('should have getLoggerFacade function exposed', function (done) {
      expect(facade).to.be.ok;
      expect(facade).to.have.property('getLoggerFacade').that.is.a('function');
      done();
    });

    it('should return empty facade if invalid loggers were supplied', function (done) {
      _.each(['a', '', null, undefined, {}, 0, 55, true, false], function (item) {
        var loggerItem = facade.getLoggerFacade(item);
        validateLogger(loggerItem);
      });
      done();
    });

    it('should return passed in logger with some needed methods is supplied', function () {

      var item = {
        log: function () {
        }
      };
      var loggerItem = facade.getLoggerFacade(item);
      expect(loggerItem).to.deep.equal(item);
    });

    it('should return passed in winston logger', function () {
      var loggerItem = facade.getLoggerFacade(winstonLogger);
      expect(loggerItem).to.deep.equal(winstonLogger);
      validateLogger(loggerItem);
    });

  });
});