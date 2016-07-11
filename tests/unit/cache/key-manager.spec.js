var chai = require('chai');
var sinon = require('sinon');

var keyManager = require('../../../lib/cache/key-manager');
var keyBuilder = require('../../../lib/cache/key-builder');
var cacheHelper = require('./cache');

chai.use(require('sinon-chai'));
var expect = chai.expect;

var PROVIDER_NAME = 'test provider';
var UNIQ_ID = 'uniq 1234';

describe('Cache: Key Manager', function () {

  it('exposes key management functions', function () {
    expect(keyManager).to.be.an('object').and.to.be.ok;
    expect(keyManager.cacheKeyIds).to.be.a('function').and.to.be.ok;
    expect(keyManager.processResultKeyIds).to.be.a('function').and.to.be.ok;
    expect(keyManager.removeCachedKeyIds).to.be.a('function').and.to.be.ok;
  });

  describe('cacheKeyIds', function () {

    it('should cache the supplied keyIds', function () {
      var cache = cacheHelper.getCache();
      var keyIds = ['1234', '33123'];
      return keyManager
      .cacheKeyIds(cache, PROVIDER_NAME, UNIQ_ID, keyIds)
      .then(function () {
        var key = keyBuilder.buildUnprocessedCacheKey(PROVIDER_NAME, UNIQ_ID);
        expect(cache.set)
        .to.have.been.calledWithExactly(key, keyIds)
          .and.to.have.been.calledOnce;
      });
    });

    it('should reject if no arguments supplied', function (done) {
      keyManager
      .cacheKeyIds()
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should resolve if no keyIds supplied', function () {
      return keyManager.cacheKeyIds(cacheHelper.getCache(), PROVIDER_NAME, UNIQ_ID);
    });

    it('should reject if cache fails ', function (done) {
      return keyManager.
      cacheKeyIds(cacheHelper.getFailCache(), PROVIDER_NAME, UNIQ_ID, [])
      .then(function(){
        done(new Error('It should reject'));
      })
      .catch(function(err){
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
  });

  describe('removeCachedKeyIds', function () {

    it('should cache remove the stored keyIds', function () {
      var cache = cacheHelper.getCache();

      return keyManager
      .removeCachedKeyIds(cache, PROVIDER_NAME, UNIQ_ID)
      .then(function () {
        var key = keyBuilder.buildUnprocessedCacheKey(PROVIDER_NAME, UNIQ_ID);
        expect(cache.del)
        .to.have.been.calledWithMatch(sinon.match.string, sinon.match.func)
          .and.to.have.been.calledOnce;
      });
    });

    it('should reject if no arguments supplied', function (done) {
      keyManager
      .removeCachedKeyIds()
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if cache fails ', function (done) {
      return keyManager.
      removeCachedKeyIds(cacheHelper.getFailCache(), PROVIDER_NAME, UNIQ_ID)
        .then(function(){
          done(new Error('It should reject'));
        })
        .catch(function(err){
          expect(err).to.be.instanceOf(Error);
          done();
        });
    });
  });

  describe('processResultKeyIds', function () {

    it('should process and store results', function () {
      var results = [
        { id: '1', msisdn: '+33644125390'},
        { id: '2', msisdn: '+33644125391'}
      ];

      var processedResults = [
        { number: results[0].msisdn},
        { number: results[1].msisdn}
      ];

      var cache = cacheHelper.createSimpleCache();
      var getSpy = sinon.spy(cache, 'get');
      var setSpy = sinon.spy(cache, 'set');
      var delSpy = sinon.spy(cache, 'del');

      return keyManager
      .processResultKeyIds(cache, PROVIDER_NAME, UNIQ_ID, results, processedResults)
      .then(function (result) {
        expect(result).to.be.an('object').and.to.be.ok;
        expect(result).to.have.property('results').and.to.deep.equal(processedResults);
        expect(result).to.have.property('done').and.to.be.a('boolean');
        var processedKey1 = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, results[0].msisdn);
        var processedKey2 = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, results[1].msisdn);
        var unprocessedKey = keyBuilder.buildUnprocessedCacheKey(PROVIDER_NAME, UNIQ_ID);

        expect(getSpy).to.have.been.calledThrice;
        expect(getSpy.firstCall).to.have.been.calledWith(unprocessedKey);
        expect(getSpy.secondCall).to.have.been.calledWith(unprocessedKey);
        expect(getSpy.lastCall).to.have.been.calledWith(unprocessedKey);

        expect(setSpy).to.have.been.calledTwice;
        expect(setSpy.firstCall).to.have.been.calledWith(processedKey1, processedResults[0]);
        expect(setSpy.secondCall).to.have.been.calledWith(processedKey2, processedResults[1]);

        expect(delSpy).to.have.been.calledTwice;
        expect(delSpy.firstCall).to.have.been.calledWith(unprocessedKey);
        expect(delSpy.secondCall).to.have.been.calledWith(unprocessedKey);

        expect(cache.storage[processedKey1]).to.deep.equal(processedResults[0]);
        expect(cache.storage[processedKey2]).to.deep.equal(processedResults[1]);
        expect(Object.keys(cache.storage)).to.have.length(results.length);
      });
    });

    it('should process and store results with previous results', function () {
      var results = [
        { id: '1', msisdn: '+33644125390'},
        { id: '2', msisdn: '+33644125391'}
      ];

      var processedResults = [
        { number: results[0].msisdn},
        { number: results[1].msisdn}
      ];

      var cache = cacheHelper.createSimpleCache();
      var getSpy = sinon.spy(cache, 'get');
      var setSpy = sinon.spy(cache, 'set');
      var delSpy = sinon.spy(cache, 'del');

      var unprocessedKey = keyBuilder.buildUnprocessedCacheKey(PROVIDER_NAME, UNIQ_ID);
      var extraKeyId = '3';
      var keyIds = [results[0].id, results[1].id, extraKeyId];

      return cache
      .set(unprocessedKey, keyIds)
      .then(function () {
        return keyManager
        .processResultKeyIds(cache, PROVIDER_NAME, UNIQ_ID, results, processedResults)
        .then(function (result) {
          expect(result).to.be.an('object').and.to.be.ok;
          expect(result).to.have.property('results').and.to.deep.equal(processedResults);
          expect(result).to.have.property('done').and.to.be.a('boolean');

          var processedKey1 = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, results[0].msisdn);
          var processedKey2 = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, results[1].msisdn);

          expect(getSpy).to.have.been.calledThrice;
          expect(getSpy.firstCall).to.have.been.calledWith(unprocessedKey);
          expect(getSpy.secondCall).to.have.been.calledWith(unprocessedKey);
          expect(getSpy.thirdCall).to.have.been.calledWith(unprocessedKey);
          expect(getSpy.lastCall).to.have.been.calledWith(unprocessedKey);

          expect(setSpy).to.have.been.called.callCount(5);
          expect(delSpy).to.not.have.been.called;

          expect(cache.storage[processedKey1]).to.deep.equal(processedResults[0]);
          expect(cache.storage[processedKey2]).to.deep.equal(processedResults[1]);
          expect(cache.storage[unprocessedKey]).to.deep.equal([extraKeyId]);

          expect(Object.keys(cache.storage)).to.have.length(keyIds.length);
        });
      });

    });

    it('should reject if results argument is not array', function (done) {
      keyManager
      .processResultKeyIds(cacheHelper.getCache(), PROVIDER_NAME, UNIQ_ID)
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if processedResults argument is not array', function (done) {
      keyManager
      .processResultKeyIds(cacheHelper.getCache(), PROVIDER_NAME, UNIQ_ID, [])
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if no arguments supplied', function (done) {
      keyManager
      .processResultKeyIds()
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if cache fails ', function (done) {
      return keyManager.
      processResultKeyIds(cacheHelper.getFailCache())
      .then(function(){
        done(new Error('It should reject'));
      })
      .catch(function(err){
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

  });

});