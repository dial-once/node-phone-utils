/*jshint -W030 */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var _ = require('lodash');
var HLRLookupsProvider = require('../../lib/providers/hlr_lookups_provider');
var BaseProvider = require('../../lib/providers/base_provider');

var winston = require('winston');
var winstonLogger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({level: 'debug'})
  ]
});

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('HLR Lookups Provider', function () {

  it ('should work :-)', function (done) {
    console.log(HLRLookupsProvider);
    console.log(HLRLookupsProvider.isValid());
    console.log(HLRLookupsProvider.hlrLookup('test'));
    expect(HLRLookupsProvider.name).to.be.a('string').and.to.be.ok;
    expect(HLRLookupsProvider).to.be.instanceOf(BaseProvider);
    expect(HLRLookupsProvider.isValid()).to.be.true;
   // expect(HLRLookupsProvider.hlrLookup()).to.be.instanceOf(Promise);
    HLRLookupsProvider
    .hlrLookup('+491788735001')
      .then(function (response){
        console.log(response);
        done();
      })
      .catch(done);
  });
});