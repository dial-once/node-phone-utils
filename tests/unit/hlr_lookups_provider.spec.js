/*jshint -W030 */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var _ = require('lodash');
var phoneUtils = require('../../lib');
var BaseProvider = require('../../lib/providers/base_provider');
var HLRLookupsProvider = phoneUtils.providers.hlrLookups ;

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('HLR Lookups Provider', function () {

  it ('should  do HLR Lookup', function (done) {
    expect(HLRLookupsProvider.name).to.be.a('string').and.to.be.ok;
    expect(HLRLookupsProvider).to.be.instanceOf(BaseProvider);
    expect(HLRLookupsProvider.isValid()).to.be.true;
    HLRLookupsProvider
    .hlrLookup('+491788735001')
      .then(function (result){
        expect(result).to.be.an('object').and.to.be.ok;
        done();
      })
      .catch(done);
  });
});