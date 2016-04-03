var chai = require('chai');
var sinon = require('sinon');

var resRetriever = require('../../../lib/cache/result-retriever');
var keyBuilder = require('../../../lib/cache/key-builder');
var cacheHelper = require('./cache');

chai.use(require('sinon-chai'));
var expect = chai.expect;

var PROVIDER_NAME = 'test provider';

describe('Cache: Result Retriever', function () {

  it('exposes function for getting results', function () {
    expect(resRetriever).to.be.an('object').and.to.be.ok;
    expect(resRetriever.getResultsForNumbers).to.be.a('function').and.to.be.ok;
  });

  describe('getResultsForNumbers', function () {

    it('should get the stored results', function () {
      var cache = cacheHelper.createSimpleCache();

      var storedResult = {test: 'test'};
      var storedNumber = '123456';
      var unstoredNumber = '213343';
      var allNumbers = [storedNumber, unstoredNumber];
      var key = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, storedNumber);

      var getSpy = sinon.spy(cache, 'get');
      return cache
      .set(key, storedResult)
      .then(function () {
        return resRetriever.getResultsForNumbers(cache, allNumbers, PROVIDER_NAME);
      })
      .then(function (results) {
        expect(results).to.be.an('array').and.to.have.length(allNumbers.length);
        results.forEach(function (result) {
          expect(result).to.be.an('object').and.to.be.ok;
          expect(result.phoneNumber).to.be.a('string').and.to.be.ok;
          if (result.phoneNumber === storedNumber) {
            expect(result.found).to.equal(true);
            expect(result.result).to.deep.equal(storedResult);
          } else {
            expect(result.found).to.equal(false);
            expect(result.result).to.not.be.ok;
          }
        });

        expect(getSpy.firstCall).to.have.been.calledWithExactly(key);
        var unstoredKey = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, unstoredNumber);
        expect(getSpy.secondCall).to.have.been.calledWithExactly(unstoredKey);
        expect(getSpy).to.have.been.calledTwice;
        expect(cache.storage).to.have.property(key);
      });
    });

    it('should reject if no arguments supplied', function (done) {
      resRetriever
      .getResultsForNumbers()
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if numbers argument is not array', function (done) {
      resRetriever
      .getResultsForNumbers(cacheHelper.getCache(), 'test', PROVIDER_NAME)
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should return empty results in case of internal failure', function (done) {
      return resRetriever.getResultsForNumbers(cacheHelper.getFailCache(), [], PROVIDER_NAME)
      .then(function (result) {
        expect(result).to.be.an('array').and.to.have.length(0);
        done();
      })
      .catch(done);
    });
  });
});