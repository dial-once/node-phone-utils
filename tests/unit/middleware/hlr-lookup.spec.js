var chai = require('chai');
var sinon = require('sinon');

var createMiddleware = require('../../../lib/middleware');
var HLRLookupsProvider = require('../../../lib/providers/hlr-lookups-provider');
var mockClient = require('../../mocks/mock-hlr-lookups-client').createClient();
var keyBuilder = require('../../../lib/cache/key-builder');
var cacheHelper = require('../../unit/cache/cache');
var expect = chai.expect;
var PROVIDER_NAME = 'hlr';
var provider = new HLRLookupsProvider(PROVIDER_NAME, 'uname', 'pass', null, mockClient);

function getValidOptions(dc, rc) {
  return {
    provider: provider,
    lookupTimeout: 120,
    doneCallback: dc,
    resultCallback: rc,
    callbackIdQSParam: 'id',
    cache: cacheHelper.createSimpleCache()
  };
}

function createResponse() {
  return {
    statusCode: '',
    write: sinon.stub(),
    end: sinon.stub()
  };
}

chai.use(require('sinon-chai'));

describe('Middleware: HLR Lookup', function () {

  it('should expose function to create a middleware', function () {
    expect(createMiddleware).to.be.a('function');
  });

  it('should throw error if supplied options are not valid', function () {
    var fn = function () {
      return createMiddleware({});
    };
    expect(fn).to.throw(Error, 'Valid options object must be specified');
  });

  it('should create middleware with valid options', function () {
    var fn = function () {
      var options = getValidOptions();
      var middleware = createMiddleware(options);
      expect(middleware).to.be.a('function');
    };
    expect(fn).to.not.throw;
  });

  describe('Process request', function () {
    var processResultReq;

    beforeEach(function () {
      processResultReq = sinon.spy(provider, 'processResultReq');
    });

    afterEach(function () {
      processResultReq.restore();
    });

    it('should process a request from lookup provider and get result from cache', function (done) {
      var res = createResponse();

      var uniqeId = '12345'
      var lookupNumber = '+33892696992';
      var req = {
        query: {id: uniqeId},
        body: {
          json: {
            success: true,
            results: [
              {
                id: '123',
                msisdn: lookupNumber
              }
            ]
          }
        }
      };

      var next = sinon.spy();
      var resultCallback = sinon.spy();

      var doneCallback = function (err, results) {
        try {
          expect(err).to.be.falsy;
          expect(results).to.be.an('array').and.to.have.length(1);
          expect(results[0]).to.have.property('number', lookupNumber);
          expect(next)
          .to.have.been.calledOnce
          .and.have.been.calledWith();
          expect(res.statusCode).to.equal(202);
          expect(res.write).not.to.have.been.called;
          expect(res.end).to.have.been.calledOnce;
          expect(processResultReq).to.have.been.calledWith(req, options);
          expect(resultCallback).to.have.been.calledOnce;
          done();
        } catch (e) {
          done(e);
        }
      };

      var options = getValidOptions(doneCallback, resultCallback);

      var middleware = createMiddleware(options);
      expect(middleware).to.be.a('function');

      var resultKey = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, lookupNumber);

      options
      .cache
      .set(resultKey, {number : lookupNumber})
      .then(function (){
        var lookupNumbersKey = keyBuilder.buildLookupNumbersCacheKey(PROVIDER_NAME, uniqeId);
        return options
        .cache
        .set(lookupNumbersKey, [lookupNumber]);
      })
      .then(function(){
        return middleware(req, res, next);
      })
      .catch(done);
    });

    it('should process a request from lookup provider ', function (done) {
      var res = createResponse();

      var lookupNumber = '+33892696992';
      var req = {
        query: {id: '1234'},
        body: {
          json: {
            success: true,
            results: [
              {
                id: '123',
                msisdn: lookupNumber
              }
            ]
          }
        }
      };

      var next = sinon.spy();
      var resultCallback = sinon.spy();

      var doneCallback = function (err, results) {
        try {
          expect(err).to.be.falsy;
          expect(results).to.be.an('array').and.to.have.length(1);
          expect(results[0]).to.have.property('number', lookupNumber);
          expect(next)
          .to.have.been.calledOnce
          .and.have.been.calledWithMatch(Error);
          expect(res.statusCode).to.equal(202);
          expect(res.write).not.to.have.been.called;
          expect(res.end).to.have.been.calledOnce;
          expect(processResultReq).to.have.been.calledWith(req, options);
          expect(resultCallback).to.have.been.calledOnce;
          done();
        } catch (e) {
          done(e);
        }
      };

      var options = getValidOptions(doneCallback, resultCallback);

      var middleware = createMiddleware(options);
      expect(middleware).to.be.a('function');

      middleware(req, res, next)
      .catch(done);
    });

    it('should fail if no unique id param in request', function (done) {
      var res = createResponse();

      var req = {
        body: {
          json: {}
        }
      };

      var errorMsg = 'No unique id in request query params. (param:id)';
      var next = sinon.spy();
      var resultCallback = sinon.spy();

      var doneCallback = function (err, results) {
        try {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal(errorMsg);
          expect(results).to.be.falsy;
          expect(next).to.have.been.calledOnce;
          expect(res.statusCode).to.equal(400);
          expect(res.write)
          .to.have.been.calledOnce
          .and.to.have.been.calledWith(errorMsg);
          expect(res.end).to.have.been.calledOnce;
          expect(processResultReq).to.not.have.been.called;
          expect(resultCallback).to.have.been.calledWithMatch(Error);
          done();
        } catch (e) {
          done(e);
        }
      };

      var options = getValidOptions(doneCallback, resultCallback);

      var middleware = createMiddleware(options);
      expect(middleware).to.be.a('function');

      middleware(req, res, next)
      .then(function () {
        done(new Error('Should reject'));
      })
      .catch(function (err) {
        try {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal(errorMsg);
        } catch (e) {
          done(e);
        }
      });
    });

    it('should not send response and work without next, done and result callbacks', function () {
      var res = createResponse();

      var req = {
        query: {
          id: '1234'
        },
        body: {
          json: {
            success: true,
            results: [
              {msisdn: '+33892696992'}
            ]
          }
        }
      };

      var options = getValidOptions();
      options.middlewareSend = false;

      var middleware = createMiddleware(options);
      expect(middleware).to.be.a('function');

      return middleware(req, res)
      .then(function () {
        expect(res.statusCode).to.equal('');
        expect(res.write).to.not.have.been.called;
        expect(res.end).to.not.have.been.called;
        expect(processResultReq).to.have.been.calledOnce;
      });
    });

    it('should not call doneCallback if not all results have processed', function () {
      var res = createResponse();
      var keyIds = ['1', '2'];
      var uniqueId = '1234';
      var req = {
        query: {
          id: uniqueId
        },
        body: {
          json: {
            success: true,
            results: [
              {id: keyIds[0], msisdn: '+33892696992'}
            ]
          }
        }
      };

      var doneCallback = sinon.spy();
      var resultCallback = sinon.spy();

      var options = getValidOptions(doneCallback, resultCallback);

      var middleware = createMiddleware(options);
      expect(middleware).to.be.a('function');

      var key = keyBuilder.buildUnprocessedCacheKey(PROVIDER_NAME, uniqueId);
      return options
      .cache.set(key, [keyIds[1]])
      .then(function () {
        return middleware(req, res)
        .then(function () {
          expect(res.statusCode).to.equal(202);
          expect(res.write).to.not.have.been.called;
          expect(res.end).to.have.been.called;
          expect(processResultReq).to.have.been.calledOnce;
          expect(doneCallback).to.not.have.been.called;

          var results = [
            {
              extraData: {id: keyIds[0]},
              number: req.body.json.results[0].msisdn
            }
          ];
          expect(resultCallback).to.have.been.calledOnce
          .and.to.have.been.calledWithExactly(null, results, uniqueId);
        });
      });
    });

    it('should fail if cache fails', function (done) {
      var res = createResponse();

      var req = {
        query: {
          id: '1234'
        },
        body: {
          json: {
            success: true,
            results: [
              {msisdn: '+33892696992'}
            ]
          }
        }
      };

      var options = getValidOptions();
      options.cache = cacheHelper.getFailCache();

      var middleware = createMiddleware(options);
      expect(middleware).to.be.a('function');

      middleware(req, res)
      .then(function () {
        done(new Error('Should reject'));
      })
      .catch(function (err) {
        try {
          expect(err).to.be.instanceOf(Error);
          expect(res.statusCode).to.equal(500);
          expect(res.write).to.have.been.calledOnce;
          expect(res.end).to.have.been.calledOnce;
          expect(processResultReq).to.have.been.calledOnce;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should fail if cache delete fails', function (done) {
      var res = createResponse();

      var uniqueId = '1234';
      var req = {
        query: {
          id: uniqueId
        },
        body: {
          json: {
            success: true,
            results: [
              {id: '1', msisdn: '+33892696992'}
            ]
          }
        }
      };

      var options = getValidOptions();
      var simpleCache = cacheHelper.createSimpleCache();
      options.cache = simpleCache;
      options.cache.del = function () {
        throw new Error('fail');
      };

      var middleware = createMiddleware(options);
      expect(middleware).to.be.a('function');

      var key = keyBuilder.buildUnprocessedCacheKey(PROVIDER_NAME, uniqueId);
      return options
      .cache
      .set(key, ['1'])
      .then(function () {
        return middleware(req, res)
        .then(function () {
          done(new Error('Should reject'));
        });
      })
      .catch(function (err) {
        try {
          expect(err).to.be.instanceOf(Error);
          expect(res.statusCode).to.equal(500);
          expect(res.write).to.have.been.calledOnce;
          expect(res.end).to.have.been.calledOnce;
          expect(processResultReq).to.have.been.calledOnce;
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should process a request and fail if internals fail', function (done) {
      var res = createResponse();
      var error = new Error('test');
      var faultyLookupNumsManager = {
        getLookedUpNumberResults: sinon.stub().returns(Promise.reject(error))
      };

      var fakeTimerManager = {
        stopTimeout: sinon.stub().returns(Promise.resolve())
      };

      var lookupNumber = '+33892696992';
      var req = {
        query: {id: '1234'},
        body: {
          json: {
            success: true,
            results: [
              {
                id: '123',
                msisdn: lookupNumber
              }
            ]
          }
        }
      };

      var next = sinon.spy();
      var resultCallback = sinon.spy();

      var doneCallback = function (err, results) {
        try {
          expect(err).to.deep.equal(error);
          expect(results).to.be.falsy;

          expect(res.statusCode).to.equal(500);
          expect(res.write).to.have.been.calledOnce;
          expect(res.end).to.have.been.calledOnce;
          expect(processResultReq).to.have.been.calledWith(req, options);
          expect(resultCallback).to.have.been.calledOnce;

          expect(faultyLookupNumsManager.getLookedUpNumberResults).to.have.been.calledOnce;
          done();
        } catch (e) {
          done(e);
        }
      };

      var options = getValidOptions(doneCallback, resultCallback);

      var middleware = createMiddleware(options, faultyLookupNumsManager, fakeTimerManager);
      expect(middleware).to.be.a('function');

      middleware(req, res, next)
      .then(function () {
        done(new Error('Should reject'));
      })
      .catch(function (err) {
        try {
          expect(next)
          .to.have.been.calledOnce
          .and.have.been.calledWith(error);

          expect(fakeTimerManager.stopTimeout)
            .to.have.been.calledOnce;
          expect(err).to.deep.equal(error);
        } catch (e) {
          done(e);
        }
      });
    });

    it('should process a request and fail if res.end fails', function (done) {
      var res = createResponse();

      var error = new Error('Could not write to response');
      res.end = sinon.stub().throws(error);

      var lookupNumber = '+33892696992';
      var req = {
        query: {id: '1234'},
        body: {
          json: {
            success: true,
            results: [
              {
                id: '123',
                msisdn: lookupNumber
              }
            ]
          }
        }
      };

      var next = sinon.spy();
      var resultCallback = sinon.spy();

      var doneCallback = function (err, results) {
        try {
          expect(err).to.deep.equal(error);
          expect(results).to.be.falsy;

          expect(res.statusCode).to.equal(500);
          expect(res.write).to.not.have.been.called;
          expect(res.end).to.have.been.calledOnce;
          expect(processResultReq).to.have.been.calledWith(req, options);
          expect(resultCallback).to.have.been.calledOnce;

          expect(next)
          .to.have.been.calledOnce
          .and.have.been.calledWith(error);
          done();
        } catch (e) {
          done(e);
        }
      };

      var options = getValidOptions(doneCallback, resultCallback);

      var middleware = createMiddleware(options);
      expect(middleware).to.be.a('function');

      middleware(req, res, next)
      .then(function () {
        done(new Error('Should reject'));
      })
      .catch(function (err) {
        try {
          expect(err).to.deep.equal(error);
        } catch (e) {
          done(e);
        }
      });
    });

    it('fail is internal fail and also res.end fails', function (done) {
      var res = createResponse();

      var error = new Error('Could not write to response');
      res.end = sinon.stub().throws(error);

      var cacheError = new Error('Cache fail');
      var faultyLookupNumsManager = {
        getLookedUpNumberResults: sinon.stub().returns(Promise.reject(cacheError))
      };

      var lookupNumber = '+33892696992';
      var req = {
        query: {id: '1234'},
        body: {
          json: {
            success: true,
            results: [
              {
                id: '123',
                msisdn: lookupNumber
              }
            ]
          }
        }
      };

      var next = sinon.spy();
      var resultCallback = sinon.spy();

      var doneCallback = function (err, results) {
        try {
          expect(err).to.deep.equal(error);
          expect(results).to.be.falsy;

          expect(res.statusCode).to.equal(500);
          expect(res.write).to.have.been.called;
          expect(res.end).to.have.been.calledOnce;
          expect(processResultReq).to.have.been.calledWith(req, options);
          expect(resultCallback).to.have.been.calledOnce;

          expect(next)
          .to.have.been.calledOnce
          .and.have.been.calledWith(error);
          done();
        } catch (e) {
          done(e);
        }
      };

      var options = getValidOptions(doneCallback, resultCallback);

      var middleware = createMiddleware(options, faultyLookupNumsManager);
      expect(middleware).to.be.a('function');

      middleware(req, res, next)
      .then(function () {
        done(new Error('Should reject'));
      })
      .catch(function (err) {
        try {
          expect(err).to.deep.equal(error);
        } catch (e) {
          done(e);
        }
      });
    });

  });
});
