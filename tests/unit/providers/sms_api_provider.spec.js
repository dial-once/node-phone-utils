/*jshint -W030 */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var phoneUtils = require('../../../lib');
var BaseProvider = require('../../../lib/providers/base_provider');
var SMSAPILookupsProviderBase = require('../../../lib/providers/sms_api_provider');
var SMSAPILookupsProvider = phoneUtils.getInstance({logger: console}).getProviders().smsApi;

chai.use(chaiAsPromised);
var expect = chai.expect;
var testNumber = '+31612969525';

describe('SMSAPI.com HLR Lookup Provider', function () {

  var testFailedLookup = function testFailedLookup(wrongNumber, done) {
    SMSAPILookupsProvider
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
    expect(SMSAPILookupsProvider.name).to.be.a('string').and.to.be.ok;
    expect(SMSAPILookupsProvider).to.be.instanceOf(BaseProvider);
    expect(SMSAPILookupsProvider.isValid()).to.be.true;

    SMSAPILookupsProvider
    .hlrLookup(testNumber)
    .then(function (results) {
      expect(results).to.be.an('Array').and.to.be.ok;
      results.forEach(function (result) {
        expect(result).to.be.an('Object').and.to.be.ok;
      });
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

  it('should not perform lookup if non valid phone number string is supplied', function (done) {
    testFailedLookup('12341234123412341234', done);
  });

  it('should not allow itself to be created without valid name', function () {
    var fn = function () {
      return new SMSAPILookupsProviderBase();
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Name must be specified');
  });

  it('should not allow itself to be created without valid username', function () {
    var fn = function () {
      return new SMSAPILookupsProviderBase('testName');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Username must be specified');
  });

  it('should not allow itself to be created without valid password', function () {
    var fn = function () {
      return new SMSAPILookupsProviderBase('testName', 'testUsername');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Password must be specified');
  });

});