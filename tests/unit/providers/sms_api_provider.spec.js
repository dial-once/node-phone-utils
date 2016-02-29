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

describe('SMAPI.COM HLR Lookups Provider', function () {

  it ('should perform HLR Lookup', function (done) {
    expect(SMSAPILookupsProvider.name).to.be.a('string').and.to.be.ok;
    expect(SMSAPILookupsProvider).to.be.instanceOf(BaseProvider);
    expect(SMSAPILookupsProvider.isValid()).to.be.true;

    SMSAPILookupsProvider
    .hlrLookup(testNumber)
      .then(function (results){
        expect(results).to.be.an('Array').and.to.be.ok;
        results.forEach(function (result){
          expect(result).to.be.an('Object').and.to.be.ok;
        });
        done();
      })
      .catch(function (err){
        expect(err).to.be.instanceOf(Error);
        done(err);
      });
  });

  it ('should not allow itself to be created without valid name', function () {
    var fn = function() {
      return new SMSAPILookupsProviderBase();
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Name must be specified');
  });

  it ('should not allow itself to be created without valid username', function () {
    var fn = function() {
      return new SMSAPILookupsProviderBase('testName');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Username must be specified');
  });

  it ('should not allow itself to be created without valid password', function () {
    var fn = function() {
      return new SMSAPILookupsProviderBase('testName', 'testUsername');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Password must be specified');
  });

});