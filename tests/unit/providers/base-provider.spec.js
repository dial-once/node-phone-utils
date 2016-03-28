/*jshint -W030 */

var chai = require('chai');
var BaseProvider = require('../../../lib/providers/base-provider');

var expect = chai.expect;

describe('Base HLR Lookups Provider', function () {

  it ('should be valid when constructed', function () {
    var baseProvider = new BaseProvider('baseProvider', 'bpUname', 'bpPass');
    expect(baseProvider.hlrLookup).to.be.a('function');

  });

  it ('should throw error once hlrLookup is called', function () {
    var fn = function() {
      var baseProvider = new BaseProvider('baseProvider', 'bpUname', 'bpPass');
      return baseProvider.hlrLookup();
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'This function is a base definition and needs to be overridden by implementing classes');
  });

  it ('should not allow itself to be created without valid name', function () {
    var fn = function() {
      return new BaseProvider(null, 'testName');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Name must be specified');
  });

  it ('should not allow itself to be created without valid username', function () {
    var fn = function() {
      return new BaseProvider('testName');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Username must be specified');
  });

  it ('should not allow itself to be created without valid password', function () {
    var fn = function() {
      return new BaseProvider('testName', 'testUsername');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Password must be specified');
  });

});