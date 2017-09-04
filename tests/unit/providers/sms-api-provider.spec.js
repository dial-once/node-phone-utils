/*jshint -W030 */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var InputValidator = require('../../../lib/validators/input-validator');
var SMSAPILookupsProvider = require('../../../lib/providers/sms-api-provider');
var createMockClient = require('../../mocks/mock-sms-api-client').createClient;
var logger = require('winston');
logger.level = 'error';
var smsAPILookupsProvider = new SMSAPILookupsProvider(
  'sms-api-com',
  'username',
  'password',
  logger,
  createMockClient({logger: logger})
);

chai.use(chaiAsPromised);
var expect = chai.expect;
var testNumber = '+31612969525';

describe('SMSAPI.com HLR Lookup Provider', function () {

  var testFailedLookup = function testFailedLookup(wrongNumber, done) {
    smsAPILookupsProvider
    .hlrLookup(wrongNumber)
    .then(function () {
      done(new Error('Ooops we got results!'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      done();
    });

  };

  it('should perform HLR Lookup', function (done) {
    expect(InputValidator.isValidHLRLookupProvider(smsAPILookupsProvider)).to.be.true;

    smsAPILookupsProvider
    .hlrLookup(testNumber)
    .then(function (result) {
      expect(result).to.be.an('Object').and.to.be.ok;
      expect(result).to.have.property('number').that.is.ok;
      done();
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      done(err);
    });
  });

  it('should not perform lookup if no number is supplied', function (done) {
    testFailedLookup('', done);
  });

  it('should not perform lookup if  object is supplied', function (done) {
    testFailedLookup({}, done);
  });

  it('should not perform lookup if Array is supplied', function (done) {
    testFailedLookup([testNumber], done);
  });

  it('should not perform lookup if non E164 formatted number is supplied', function (done) {
    testFailedLookup('33 55 890 098', done);
  });

  it('should not perform lookup if invalid number is supplied', function (done) {
    testFailedLookup('y', done);
  });

  it('should not perform lookup if non valid phone number string is supplied', function (done) {
    testFailedLookup('12341234123412341234', done);
  });

  it('should not perform lookup if there is an error in the lookup client', function (done) {
    var failingClient = createMockClient({failOnExec: true});
    var smsProv = new SMSAPILookupsProvider('smsapi', 'uname', 'pass', null, failingClient);
    smsProv.hlrLookup(testNumber)
    .then(function () {
      done(new Error('Should have been rejected'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

  it('should not perform lookup if there is a unknown error in the lookup client', function (done) {
    var failingClient = createMockClient({
      failOnExec: true,
      error: {
        batman: 'NaNaNaNa'
      }
    });
    var smsProv = new SMSAPILookupsProvider('smsapi', 'uname', 'pass', null, failingClient);
    smsProv.hlrLookup(testNumber)
    .then(function () {
      done(new Error('Should have been rejected'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.contain('Unknown Error:');
      done();
    });
  });

  it('should not perform lookup if there is a detailed error in the lookup client', function (done) {
    var failingClient = createMockClient({
      failOnExec: true,
      error: {
        error: 'Test',
        message: 'failure'
      }
    });
    var smsProv = new SMSAPILookupsProvider('smsapi', 'uname', 'pass', null, failingClient);
    smsProv.hlrLookup(testNumber)
    .then(function () {
      done(new Error('Should have been rejected'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.eql('Error: Test failure');
      done();
    });
  });

  it('should not perform lookup and pass error from client', function (done) {
    var failingClient = createMockClient({failOnExec: true, error: {message: 'test'}});
    var smsProv = new SMSAPILookupsProvider('smsapi', 'uname', 'pass', null, failingClient);
    smsProv.hlrLookup(testNumber)
    .then(function () {
      done(new Error('Should have been rejected'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.eql('test');
      done();
    });
  });

  it('should not allow itself to be created without valid name', function () {
    var fn = function () {
      return new SMSAPILookupsProvider();
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Name must be specified');
  });

  it('should not allow itself to be created without valid username', function () {
    var fn = function () {
      return new SMSAPILookupsProvider('testName');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Username must be specified');
  });

  it('should not allow itself to be created without valid password', function () {
    var fn = function () {
      return new SMSAPILookupsProvider('testName', 'testUsername');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Password must be specified');
  });

});