var chai = require('chai');
var sinon = require('sinon');
var uuid = require('uuid');

var timeoutManager = require('../../../lib/cache/timeout-manager');
var keyBuilder = require('../../../lib/cache/key-builder');
var cacheHelper = require('./cache');

chai.use(require('sinon-chai'));
var expect = chai.expect;

var PROVIDER_NAME = 'test provider';

describe('Cache: Timeout Manager', function () {

  it('exposes timeout management functions', function () {
    expect(timeoutManager).to.be.an('object').and.to.be.ok;
    expect(timeoutManager.startTimeout).to.be.a('function').and.to.be.ok;
    expect(timeoutManager.stopTimeout).to.be.a('function').and.to.be.ok;
  });

  describe('startTimeout', function () {

    it('should start the timeout and trigger done callback', function (done) {
      var cache = cacheHelper.getCache();
      var options = {
        cache: cache,
        doneCallback: function (err, results) {
          try {
            expect(results).to.be.an('array').and.to.have.length(0);
            done(err);
          } catch (e) {
            done(e);
          }
        }
      };

      timeoutManager
      .startTimeout(options, 500, uuid.v4(), PROVIDER_NAME);
    });

    it('should start the timeout and report results in done callback', function (done) {
      var cache = cacheHelper.createSimpleCache();
      var unid = uuid.v4();
      var number = '1234';
      var key = keyBuilder.buildLookupNumbersCacheKey(PROVIDER_NAME, unid);
      var numKey = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, number);

      var result = {test: 'test', number: number};
      cache
      .set(key, [number])
      .then(function () {
        return cache.set(numKey, result);
      })
      .then(function () {
        var options = {
          cache: cache,
          doneCallback: function (err, results) {
            try {
              if (err) return done(err);
              expect(results).to.be.an('array').and.to.have.length(1);
              expect(results[0]).to.eql(result);
              expect(cache.storage[numKey]).to.eql(result);
              expect(Object.keys(cache.storage)).to.have.length(1);
              done();
            } catch (e) {
              done(e);
            }
          }
        };
        return timeoutManager
        .startTimeout(options, 500, unid, PROVIDER_NAME);
      })
      .catch(done);
    });

    it('should start the timeout, do cleanup without done callback', function () {
        var options = {
          cache: cacheHelper.getCache()
        };
        return timeoutManager
        .startTimeout(options, 500, uuid.v4(), PROVIDER_NAME);
    });

    it('should fail if arguments are missing', function (done) {
      timeoutManager
      .startTimeout()
      .then(function () {
        done(new Error('It should fail'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

    it('should fail if faulty cache is provided via options', function (done) {
      var options = {
        cache: cacheHelper.getFailCache(),
        doneCallback: function (err) {
          try {
            expect(err).to.be.instanceOf(Error);
            done();
          } catch (e) {
            done(e);
          }
        }
      };

      timeoutManager
      .startTimeout(options, 500, uuid.v4(), PROVIDER_NAME)
      .catch(done);
    });

    it('should fail if no uniqueId provided', function (done) {
      var options = {
        cache: cacheHelper.getCache(),
        doneCallback: function (err) {
          try {
            expect(err).to.be.instanceOf(Error);
            done();
          } catch (e) {
            done(e);
          }
        }
      };

      timeoutManager
      .startTimeout(options, 500, null, PROVIDER_NAME)
      .then(function () {
        done(new Error('Should Reject'));
      })
      .catch(function(err){
        try {
          expect(err).to.be.instanceOf(Error);
        } catch (e) {
          done(e);
        }
      });
    });

  });

  describe('stopTimeout', function () {

    it('should stop the started timeout', function (done) {
      var cache = cacheHelper.getCache();
      var options = {
        cache: cache,
        doneCallback: function () {
          done(new Error('Done callback should not be triggered'));
        }
      };

      var unid = uuid.v4();
      timeoutManager
      .startTimeout(options, 500, unid, PROVIDER_NAME)
      .then(function () {
        return timeoutManager
        .stopTimeout(unid, options)
        .then(function () {
          expect(cache.get).to.not.have.been.called;
          expect(cache.set).to.not.have.been.called;
          expect(cache.del).to.not.have.been.called;
          done();
        });
      })
      .catch(done);
    });

    it('should not fail if there is no started timeout', function () {
      return timeoutManager.stopTimeout(uuid.v4(), {});
    });

    it('should not fail if there are no options provided', function () {
      return timeoutManager.stopTimeout(uuid.v4());
    });

    it('should reject if there are no arguments provided', function (done) {
      timeoutManager
      .stopTimeout()
      .then(function () {
        done(new Error('Should not resolve'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.eql('Unique id must be a valid string');
        done();
      });
    });

  });
});