/*jshint -W030 */
var chai = require('chai');

var msgFormatter = require('../../../lib/helpers/logger-message-formatter');

var expect = chai.expect;

describe('Helpers: Logger Message Formatter', function () {

  describe('getLoggerMessageFunc', function () {

    it('should have getLoggerFacade function exposed', function () {
      expect(msgFormatter).to.be.ok;
      expect(msgFormatter).to.have.property('getLoggerMessageFunc').that.is.a('function');
      var moduleFmtFunc = msgFormatter.getLoggerMessageFunc('testModule');
      expect(moduleFmtFunc).to.be.a('function');
      var functionFmtFunc = moduleFmtFunc('testFunction');
      expect(functionFmtFunc).to.be.a('function');
      expect(functionFmtFunc('test')).to.be.a('string').that.is.ok;
    });

    it('should compose a log entry based on lib, module, function and a test message', function () {
      var leString = msgFormatter.getLoggerMessageFunc('test_module')('test_function')('test message');
      expect(leString).to.eql('[phone-number-utils:test_module:test_function] test message');
    });

    it('should compose a log entry based on lib, module, function and a no message', function () {
      var leString = msgFormatter.getLoggerMessageFunc('test_module')('test_function')();
      expect(leString).to.eql('[phone-number-utils:test_module:test_function] ');
    });

    it('should compose a log entry based on lib, module, function and a number for message', function () {
      var leString = msgFormatter.getLoggerMessageFunc('test_module')('test_function')(123);
      expect(leString).to.eql('[phone-number-utils:test_module:test_function] 123');
    });

    it('should throw error when invalid module name supplied', function (done) {
      try {
        msgFormatter.getLoggerMessageFunc()('test_function')(123);
      } catch (e) {
        return done();
      }

      done(new Error('failed to throw error'));

    });

    it('should throw error when invalid function name supplied', function (done) {
      try {
        msgFormatter.getLoggerMessageFunc('test_module')()(123);
      } catch (e) {
        return done();
      }

      done(new Error('failed to throw error'));

    });

  });
});