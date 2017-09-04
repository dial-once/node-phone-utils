/*jshint -W030 */
var chai = require('chai');
var _ = require('lodash');
var validateLogger = require('./common').validateLogger;

var optsParser = require('../../../lib/logging/logger-options-parser');

var winston = require('winston');
var winstonLogger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({level: 'error'})
  ]
});

var expect = chai.expect;

describe('Logging: Options Parser', function () {

  describe('getLoggerFromOptions', function () {

    it('should have getLoggerFacade function exposed', function (done) {
      expect(optsParser).to.be.ok;
      expect(optsParser).to.have.property('getLoggerFromOptions').that.is.a('function');
      done();
    });

    it('should return empty logger facade if no options were supplied', function () {
        var loggerItem = optsParser.getLoggerFromOptions();
        validateLogger(loggerItem);
    });

    it('should return empty logger facade if empty options were supplied', function () {
      var loggerItem = optsParser.getLoggerFromOptions({});
      validateLogger(loggerItem);
    });

    it('should return empty logger facade if options with empty logger were supplied', function () {
      var loggerItem = optsParser.getLoggerFromOptions({logger:{}});
      validateLogger(loggerItem);
    });

    it('should return empty logger facade if options with invalid logger type logger were supplied', function () {
      var loggerItem = optsParser.getLoggerFromOptions({logger: 'logger'});
      validateLogger(loggerItem);
    });

    it('should return empty logger facade if invalid options were supplied', function (done) {
      _.each(['a', '', null, undefined, {}, 0, 55, true, false], function (item) {
        var loggerItem = optsParser.getLoggerFromOptions({logger:item});
        validateLogger(loggerItem);
      });
      done();
    });

    it('should return passed in winston logger', function () {
      var loggerItem = optsParser.getLoggerFromOptions({logger:winstonLogger});
      expect(loggerItem).to.deep.equal(winstonLogger);
      validateLogger(loggerItem);
    });

  });
});