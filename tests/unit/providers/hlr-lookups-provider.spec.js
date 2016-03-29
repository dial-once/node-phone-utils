/*jshint -W030 */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var phoneUtils = require('../../../lib');
var HLRLookupsProviderBase = require('../../../lib/providers/hlr-lookups-provider');
var InputValidator = require('../../../lib/validators/input-validator');
var HLRLookupsProvider = phoneUtils.createInstance({logger:console}).getProviders().hlrLookups;

chai.use(chaiAsPromised);
var expect = chai.expect;

var testNumber = '+491788735001';

describe('HLR-Lookups.com Provider', function () {

  it ('should do HLR Lookup', function (done) {
    expect(InputValidator.isValidHLRLookupProvider(HLRLookupsProvider)).to.be.true;
    expect(HLRLookupsProvider.name).to.be.a('string').and.to.be.ok;
    HLRLookupsProvider
    .hlrLookup(testNumber)
      .then(function (results){
        expect(results).to.be.an('Array').and.to.be.ok;
        results.forEach(function (result) {
          expect(result).to.be.an('object').and.to.be.ok;
        });
        done();
      })
      .catch(done);
  });

  it ('should not do HLR Lookup is supplied number is not a valid e164 number', function (done) {

    HLRLookupsProvider
    .hlrLookup('test number')
    .then(function (){
      done(new Error('This should not be fulfilled!'));
    })
    .catch(function (err){
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

  it ('should not do HLR Lookup is supplied number is not a valid string', function (done) {

    HLRLookupsProvider
    .hlrLookup('')
    .then(function (){
      done(new Error('This should not be fulfilled!'));
    })
    .catch(function (err){
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

  it ('should not do HLR Lookup is supplied number is not a valid formatted phone number', function (done) {

    HLRLookupsProvider
    .hlrLookup('00 44 99 88 900')
    .then(function (){
      done(new Error('This should not be fulfilled!'));
    })
    .catch(function (err){
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

  it ('should not do HLR Lookup is supplied number is not a valid e164 phone number', function (done) {

    HLRLookupsProvider
    .hlrLookup('1234123400449988900123412341234')
    .then(function (){
      done(new Error('This should not be fulfilled!'));
    })
    .catch(function (err){
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

  it ('should not allow itself to be created without valid name', function () {
    var fn = function() {
      return new HLRLookupsProviderBase();
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Name must be specified');
  });

  it ('should not allow itself to be created without valid username', function () {
    var fn = function() {
      return new HLRLookupsProviderBase('testName');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Username must be specified');
  });

  it ('should not allow itself to be created without valid password', function () {
    var fn = function() {
      return new HLRLookupsProviderBase('testName', 'testUsername');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Password must be specified');
  });
});