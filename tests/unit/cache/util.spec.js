var chai = require('chai');
var sinon = require('sinon');

var utils = require('../../../lib/cache/utils');
var cacheHelper = require('./cache');

chai.use(require('sinon-chai'));
var expect = chai.expect;

describe('Cache: Utils', function () {

  it('exposes function', function () {
    expect(utils).to.be.an('object').and.to.be.ok;
    expect(utils.delKey).to.be.a('function').and.to.be.ok;
  });

  describe('delKey', function () {

    it('should perform cache delete and return a promise', function () {
      var cache = cacheHelper.getCache();
      var key = 'test:key';
      var promise = utils.delKey(cache, key);
      expect(promise).to.be.instanceOf(Promise);
      return promise
        .then(function () {
          expect(cache.del).to.have.been.calledWithExactly(key, sinon.match.func);
        });
    });

    it('should reject if no arguments supplied', function (done) {
      utils
      .delKey()
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if key argument supplied', function (done) {
      utils
      .delKey(cacheHelper.getCache())
      .then(function () {
        done(new Error('should reject'));
      })
      .catch(function (error) {
        expect(error).to.be.instanceOf(Error);
        done();
      });
    });
  });
});