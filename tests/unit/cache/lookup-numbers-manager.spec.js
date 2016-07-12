var chai = require('chai');
var sinon = require('sinon');

var lnManager = require('../../../lib/cache/lookup-numbers-manager');
var keyBuilder = require('../../../lib/cache/key-builder');
var cacheHelper = require('./cache');

chai.use(require('sinon-chai'));
var expect = chai.expect;

var PROVIDER_NAME = 'test provider';
var UNIQ_ID = 'uniq 1234';

describe('Cache: Lookup Numbers Manager', function () {

  it('exposes lookup numbers management functions', function () {
    expect(lnManager).to.be.an('object').and.to.be.ok;
    expect(lnManager.removeLookedUpNumbers).to.be.a('function').and.to.be.ok;
    expect(lnManager.getLookedUpNumberResults).to.be.a('function').and.to.be.ok;
    expect(lnManager.storeLookedUpNumbers).to.be.a('function').and.to.be.ok;
  });

  describe('removeLookedUpNumbers', function () {

    it('should remove the stored numbers', function () {
      var cache = cacheHelper.createSimpleCache();
      var key = keyBuilder.buildLookupNumbersCacheKey(PROVIDER_NAME, UNIQ_ID);

      var delSpy = sinon.spy(cache, 'del');
      return cache
      .set(key, ['2'])
      .then(function () {
        return lnManager.removeLookedUpNumbers(cache, PROVIDER_NAME, UNIQ_ID);
      })
      .then(function () {
        expect(delSpy)
        .to.have.been.calledWithExactly(key, sinon.match.func)
          .and.to.have.been.calledOnce;
        expect(cache.storage).to.not.have.property(key);
      });
    });

    it('should reject if no arguments supplied', function (done) {
      lnManager
      .removeLookedUpNumbers()
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if cache fails ', function (done) {
      return lnManager.removeLookedUpNumbers(cacheHelper.getFailCache(), PROVIDER_NAME, UNIQ_ID)
      .then(function () {
        done(new Error('It should reject'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
  });

  describe('storeLookedUpNumbers', function () {

    it('should store the looked up numbers', function () {
      var cache = cacheHelper.getCache();
      var numbers = [1, 2, 3];
      return lnManager
      .storeLookedUpNumbers(cache, PROVIDER_NAME, UNIQ_ID, numbers)
      .then(function () {
        var key = keyBuilder.buildLookupNumbersCacheKey(PROVIDER_NAME, UNIQ_ID);
        expect(cache.set)
        .to.have.been.calledWithExactly(key, numbers)
          .and.to.have.been.calledOnce;
      });
    });

    it('should reject if no arguments supplied', function (done) {
      lnManager
      .storeLookedUpNumbers()
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if cache fails ', function (done) {
      return lnManager.storeLookedUpNumbers(cacheHelper.getFailCache(), PROVIDER_NAME, UNIQ_ID, [])
      .then(function () {
        done(new Error('It should reject'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });
  });

  describe('getLookedUpNumberResults', function () {

    it('should get results for stored looked up numbers', function () {
      var number = {msisdn: '+33644125390'};
      var processedResult = {number: number.msisdn};
      var cache = cacheHelper.createSimpleCache();

      var pKey = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, number.msisdn);
      var lookupNumbersKey = keyBuilder.buildLookupNumbersCacheKey(PROVIDER_NAME, UNIQ_ID);

      var getSpy;
      var setSpy;
      var delSpy;

      return cache
      .set(pKey, processedResult)
      .then(function () {
        return cache.set(lookupNumbersKey, [number.msisdn]);
      })
      .then(function () {
        getSpy = sinon.spy(cache, 'get');
        setSpy = sinon.spy(cache, 'set');
        delSpy = sinon.spy(cache, 'del');
        return lnManager.getLookedUpNumberResults(cache, PROVIDER_NAME, UNIQ_ID);
      })
      .then(function (results) {
        expect(results).to.be.an('array').and.to.be.ok;
        expect(results[0]).to.deep.equal(processedResult);

        expect(getSpy).to.have.been.called;
        expect(setSpy).to.not.have.been.called;
        expect(delSpy).to.not.have.been.called;

        expect(cache.storage).to.have.property(pKey).that.is.ok;
        expect(cache.storage).to.have.property(lookupNumbersKey).that.is.ok;
      });
    });

    it('should get results if any', function () {
      return lnManager
      .getLookedUpNumberResults(cacheHelper.getCache(), PROVIDER_NAME, UNIQ_ID)
      .then(function(results){
          expect(results).to.be.an('array').and.have.length(0);
        });
    });

    it('should reject if no arguments supplied', function (done) {
      lnManager
      .getLookedUpNumberResults()
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if cache fails ', function (done) {
      return lnManager
      .getLookedUpNumberResults(cacheHelper.getFailCache(), PROVIDER_NAME, UNIQ_ID)
      .then(function () {
        done(new Error('It should reject'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Get fail');
        done();
      });
    });
  });

});