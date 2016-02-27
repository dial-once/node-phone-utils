/*jshint -W030 */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var phoneUtils = require('../../../lib');
var BaseProvider = require('../../../lib/providers/base_provider');
var HLRLookupsProviderBase = require('../../../lib/providers/hlr_lookups_provider');
var HLRLookupsProvider = phoneUtils.getInstance({logger:console}).getProviders().hlrLookups;

chai.use(chaiAsPromised);
var expect = chai.expect;

var testNumber = '+491788735001';

describe('HLR Lookups Provider', function () {

  it ('should do HLR Lookup', function (done) {
    expect(HLRLookupsProvider.name).to.be.a('string').and.to.be.ok;
    expect(HLRLookupsProvider).to.be.instanceOf(BaseProvider);
    expect(HLRLookupsProvider.isValid()).to.be.true;
    HLRLookupsProvider
    .hlrLookup(testNumber)
      .then(function (result){
        expect(result).to.be.an('object').and.to.be.ok;
        done();
      })
      .catch(done);
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