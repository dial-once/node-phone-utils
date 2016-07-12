/*jshint -W030 */
var chai = require('chai');
var keyBuilder = require('../../../lib/cache/key-builder');

var expect = chai.expect;

describe('Cache: Key Builder', function () {

  it ('exposes key building functions', function() {
    expect(keyBuilder).to.be.an('object').and.to.be.ok;
    expect(keyBuilder.buildLookupNumbersCacheKey).to.be.a('function').and.to.be.ok;
    expect(keyBuilder.buildProcessedCacheKey).to.be.a('function').and.to.be.ok;
    expect(keyBuilder.buildUnprocessedCacheKey).to.be.a('function').and.to.be.ok;
    expect(keyBuilder.buildTimerCacheKey).to.be.a('function').and.to.be.ok;
  });

  describe('buildLookupNumbersCacheKey', function () {

    it('should build a lookup numbers key', function () {
      var key = keyBuilder.buildLookupNumbersCacheKey('test provider', 'some unique id');
      expect(key).to.be.a('string').and.to.equal('lnums:test-provider:some-unique-id');
    });

    it('should throw an error if no arguments supplied', function () {
      var fn = function() {
        keyBuilder.buildLookupNumbersCacheKey();
      };
      expect(fn).to.throw(TypeError);
    });

  });

  describe('buildProcessedCacheKey', function () {

    it('should build a processed results key', function () {
      var key = keyBuilder.buildProcessedCacheKey('test provider', '+33892696992');
      expect(key).to.be.a('string').and.to.equal('rst:test-provider:33892696992');
    });

    it('should throw an error if no arguments supplied', function () {
      var fn = function() {
        keyBuilder.buildProcessedCacheKey();
      };
      expect(fn).to.throw(TypeError);

    });

    it('should throw an error if invalid pone number supplied', function () {
      var fn = function() {
        keyBuilder.buildProcessedCacheKey('provider', 'aba');
      };
      expect(fn).to.throw(TypeError, 'Not a valid phone number');
    });

  });

  describe('buildUnprocessedCacheKey', function () {

    it('should build an unprocessed results key', function () {
      var key = keyBuilder.buildUnprocessedCacheKey('test provider', 'uniq id');
      expect(key).to.be.a('string').and.to.equal('lkp:test-provider:uniq-id');
    });

    it('should throw an error if no arguments supplied', function () {
      var fn = function() {
        keyBuilder.buildUnprocessedCacheKey();
      };
      expect(fn).to.throw(TypeError);
    });

  });

  describe('buildTimerCacheKey', function () {

    it('should build a timer key', function () {
      var key = keyBuilder.buildTimerCacheKey('uniq id');
      expect(key).to.be.a('string').and.to.equal('tmr:uniq-id');
    });

    it('should throw an error if no argument supplied', function () {
      var fn = function() {
        keyBuilder.buildTimerCacheKey();
      };
      expect(fn).to.throw(TypeError);

    });

  });
});