/*jshint -W030 */
var chai = require('chai');
var sinon = require('sinon');

var InputValidator = require('../../../lib/validators/input-validator');
var HLRLookupsProvider = require('../../../lib/providers/hlr-lookups-provider');
var createMockClient = require('../../mocks/mock-hlr-lookups-client').createClient;
var createSimpleCache = require('../cache/cache').createSimpleCache;
var keyBuilder = require('../../../lib/cache/key-builder');
var winston = require('winston');
winston.level = 'error';
var logger = winston;
var hlrLookupsProvider = new HLRLookupsProvider(
  'hlr-lookups.com',
  'username',
  'password',
  logger,
  createMockClient({logger: logger}));

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));
var expect = chai.expect;

var testNumber = '+491788735001';

describe('HLR-Lookups.com Provider', function () {

  it('should do HLR Lookup', function (done) {
    expect(InputValidator.isValidHLRLookupProvider(hlrLookupsProvider)).to.be.true;
    expect(hlrLookupsProvider.name).to.be.a('string').and.to.be.ok;
    hlrLookupsProvider
    .hlrLookup(testNumber)
    .then(function (results) {
      expect(results).to.be.an('Array').and.to.be.ok;
      results.forEach(function (result) {
        expect(result).to.be.an('object').and.to.be.ok;
      });
      done();
    })
    .catch(done);
  });

  it('should not do HLR Lookup if client fails', function (done) {
    var client = createMockClient({failSubmitSyncLookupRequest: true});
    var provider = new HLRLookupsProvider('test', 'uname', 'pass', null, client);
    provider
    .hlrLookup(testNumber)
    .then(function () {
      done(new Error('Should reject'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.equal('Request was not successful');
      done();
    });
  });

  it('should not do HLR Lookup is supplied number is not a valid e164 number', function (done) {

    hlrLookupsProvider
    .hlrLookup('test number')
    .then(function () {
      done(new Error('This should not be fulfilled!'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

  it('should not do HLR Lookup is supplied number is not a valid string', function (done) {

    hlrLookupsProvider
    .hlrLookup('')
    .then(function () {
      done(new Error('This should not be fulfilled!'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

  it('should not do HLR Lookup is supplied number is not a valid formatted phone number', function (done) {

    hlrLookupsProvider
    .hlrLookup('00 44 99 88 900')
    .then(function () {
      done(new Error('This should not be fulfilled!'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

  it('should not do HLR Lookup is supplied number is not a valid e164 phone number', function (done) {

    hlrLookupsProvider
    .hlrLookup('1234123400449988900123412341234')
    .then(function () {
      done(new Error('This should not be fulfilled!'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

  it('should not allow itself to be created without valid name', function () {
    var fn = function () {
      return new HLRLookupsProvider();
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Name must be specified');
  });

  it('should not allow itself to be created without valid username', function () {
    var fn = function () {
      return new HLRLookupsProvider('testName');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Username must be specified');
  });

  it('should not allow itself to be created without valid password', function () {
    var fn = function () {
      return new HLRLookupsProvider('testName', 'testUsername');
    };
    expect(fn).to.throw(Error).and.to.have.property('message', 'Password must be specified');
  });

  describe('asyncHlrLookup', function () {

    it('should do async hrl lookup', function () {
      var validNumbers = ['+33892696992', '+16502821370'];
      var invalidNumber = 'invalidNum';
      var numbers = validNumbers.concat([invalidNumber]);
      var client = createMockClient({logger: console});

      var setAsyncCallbackUrlSpy = sinon.spy(client, 'setAsyncCallbackUrl');
      var submitAsyncLookupRequestSpy = sinon.spy(client, 'submitAsyncLookupRequest');
      var submitSyncLookupRequestSpy = sinon.spy(client, 'submitSyncLookupRequest');

      var asyncProvider = new HLRLookupsProvider('hlr-lookups.com', 'username', 'password', logger, client);
      expect(InputValidator.isValidHLRLookupProvider(asyncProvider)).to.be.true;

      var callbackUrl = 'http://localhost/callback?test=12';
      var options = {
        cache: createSimpleCache(),
        provider: asyncProvider,
        callbackIdQSParam: 'id',
        lookupTimeout: 500,
        callbackUrl: callbackUrl
      };
      return asyncProvider
      .asyncHlrLookup(numbers, callbackUrl, options)
      .then(function (result) {
        expect(result).to.be.an('object').and.to.not.be.empty;
        expect(result.done).to.be.a('boolean');
        expect(result.fromCache).to.be.an('Array').and.to.be.empty;
        expect(result.uniqueId).to.be.a('string').and.to.be.ok;
        expect(result.rejected).to.be.an('Array').and.not.to.be.empty;
        expect(result.rejected).to.include(invalidNumber);
        expect(result.accepted).to.be.an('Array').and.not.to.be.empty;
        expect(result.accepted).to.not.include(invalidNumber);
        expect(result.accepted).to.include(validNumbers[0]);
        expect(result.accepted).to.include(validNumbers[1]);

        expect(setAsyncCallbackUrlSpy).to.have.been.calledWithExactly(sinon.match.func, sinon.match.string);
        expect(submitSyncLookupRequestSpy).to.not.have.been.called;
        expect(submitAsyncLookupRequestSpy).to.have.been.calledWithExactly(sinon.match.func, validNumbers);
      });
    });

    it('should do async hrl lookup and get previously cached results', function () {
      var cachedNumber = '+33892696992';
      var validNumbers = [cachedNumber, '+16502821370'];
      var client = createMockClient();
      var cache = createSimpleCache();

      var setAsyncCallbackUrlSpy = sinon.spy(client, 'setAsyncCallbackUrl');
      var submitAsyncLookupRequestSpy = sinon.spy(client, 'submitAsyncLookupRequest');
      var submitSyncLookupRequestSpy = sinon.spy(client, 'submitSyncLookupRequest');

      var providerName = 'hlr-lookups.com';
      var asyncProvider = new HLRLookupsProvider(providerName, 'username', 'password', logger, client);
      expect(InputValidator.isValidHLRLookupProvider(asyncProvider)).to.be.true;

      var callbackUrl = 'http://localhost/callback';
      var options = {
        cache: cache,
        provider: asyncProvider,
        callbackIdQSParam: 'id',
        lookupTimeout: 500,
        callbackUrl: callbackUrl
      };
      var key = keyBuilder.buildProcessedCacheKey(providerName, cachedNumber);
      return cache
      .set(key, {result: 'test'})
      .then(function () {
        return asyncProvider
        .asyncHlrLookup(validNumbers, callbackUrl, options)
        .then(function (result) {
          expect(result).to.be.an('object').and.to.not.be.empty;
          expect(result.done).to.be.a('boolean');
          expect(result.fromCache).to.be.an('Array').and.to.include(cachedNumber);
          expect(result.uniqueId).to.be.a('string').and.to.be.ok;
          expect(result.rejected).to.be.an('Array').and.not.to.be.empty;
          expect(result.accepted).to.be.an('Array').and.not.to.be.empty;
          expect(result.accepted).to.include(validNumbers[0]);
          expect(result.accepted).to.include(validNumbers[1]);

          expect(setAsyncCallbackUrlSpy).to.have.been.calledWithExactly(sinon.match.func, sinon.match.string);
          expect(submitSyncLookupRequestSpy).to.not.have.been.called;
          expect(submitAsyncLookupRequestSpy).to.have.been.calledWithExactly(sinon.match.func, sinon.match.array);
        });
      });
    });

    it('should do async hrl lookup and get all results from cache', function () {
      var numbers = require('../../fixtures/hlr-lookup-responses.json').numbers;
      var client = createMockClient();
      var cache = createSimpleCache();

      var providerName = 'hlr-lookups.com';
      var asyncProvider = new HLRLookupsProvider(providerName, 'username', 'password', logger, client);
      expect(InputValidator.isValidHLRLookupProvider(asyncProvider)).to.be.true;

      var callbackUrl = 'http://localhost/callback';
      var options = {
        cache: cache,
        provider: asyncProvider,
        callbackIdQSParam: 'id',
        lookupTimeout: 500,
        callbackUrl: callbackUrl
      };
      var promises = numbers.map(function (number) {
        var key = keyBuilder.buildProcessedCacheKey(providerName, number);
        return cache.set(key, {result: number});
      });

      var setAsyncCallbackUrlSpy = sinon.spy(client, 'setAsyncCallbackUrl');
      var submitAsyncLookupRequestSpy = sinon.spy(client, 'submitAsyncLookupRequest');
      var submitSyncLookupRequestSpy = sinon.spy(client, 'submitSyncLookupRequest');

      return Promise
      .all(promises)
      .then(function () {
        return asyncProvider
        .asyncHlrLookup(numbers, callbackUrl, options)
        .then(function (result) {
          expect(result).to.be.an('object').and.to.not.be.empty;
          expect(result.done).to.be.true;
          expect(result.fromCache).to.deep.equal(numbers);
          expect(result.uniqueId).to.be.a('string').and.to.be.ok;
          expect(result.accepted).to.be.an('Array').and.not.to.be.empty;
          numbers.forEach(function (number) {
            expect(result.accepted).to.include(number);
            expect(result.accepted).to.include(number);
          });

          expect(setAsyncCallbackUrlSpy).to.not.have.been.called;
          expect(submitSyncLookupRequestSpy).to.not.have.been.called;
          expect(submitAsyncLookupRequestSpy).to.not.have.been.called;
        });
      });
    });

    it('should reject if called without arguments', function (done) {
      hlrLookupsProvider
      .asyncHlrLookup()
      .then(function () {
        done(new Error('test'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if called without options argument', function (done) {
      hlrLookupsProvider
      .asyncHlrLookup([], 'testCallback')
      .then(function () {
        done(new Error('test'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });
    });

    it('should reject if called without callbackUrl argument', function (done) {
      hlrLookupsProvider
      .asyncHlrLookup([testNumber], null, {callbackIdQSParam: 'id', cache: createSimpleCache()})
      .then(function (result) {
        done(new Error('Should reject'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('callbackUrl must be a valid string');
        done();
      });
    });

    it('should reject if called without numbers argument', function (done) {
      hlrLookupsProvider
      .asyncHlrLookup(null, 'callback', {callbackIdQSParam: 'id', cache: createSimpleCache()})
      .then(function () {
        done(new Error('Should reject'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Numbers is not a valid string array');
        done();
      });
    });

    it('should reject if client setAsyncCallbackUrl fails', function (done) {
      var provider = new HLRLookupsProvider('hlr', 'uname', 'pass', null, createMockClient({failSetAsyncCallbackUrl: true}));
      provider
      .asyncHlrLookup([testNumber], 'testCallback', {callbackIdQSParam: 'id', cache: createSimpleCache()})
      .then(function () {
        done(new Error('test'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Failed to set callbackUlr.');
        done();
      });
    });

    it('should reject if client submitAsyncLookupRequest fails', function (done) {
      var client = createMockClient({failSubmitAsyncLookupRequest: true});
      var provider = new HLRLookupsProvider('hlr', 'uname', 'pass', null, client);
      provider
      .asyncHlrLookup([testNumber], 'testCallback', {callbackIdQSParam: 'id', cache: createSimpleCache()})
      .then(function () {
        done(new Error('test'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Failed to perform hlr lookup.');
        done();
      });
    });

    it('should reject if client submitAsyncLookupRequest returns no results', function (done) {
      var client = createMockClient({failSubmitAsyncLookupRequestNoRes: true});
      var provider = new HLRLookupsProvider('hlr', 'uname', 'pass', null, client);
      provider
      .asyncHlrLookup([testNumber], 'testCallback', {callbackIdQSParam: 'id', cache: createSimpleCache()})
      .then(function () {
        done(new Error('test'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('Unable to read results from provider response.');
        done();
      });
    });

  });

  describe('processResultReq', function () {

    var apiResult = {
      id: '9764ddc367ad',
      msisdncountrycode: 'FR',
      msisdn: '+33644125380',
      mccmnc: '20801',
      mcc: '208',
      mnc: '01',
      originalnetworkname: 'Orange',
      originalcountryname: 'France',
      originalcountrycode: 'FR',
      isvalid: 'Yes'
    };

    it('should process the incoming request', function () {
      var req = {
        query: {
          id: '12345'
        },
        body: {
          json: {
            success: true,
            results: [apiResult]
          }
        }
      };

      var options = {
        cache: createSimpleCache(),
        provider: hlrLookupsProvider,
        callbackIdQSParam: 'id', // must match req.query.id
        lookupTimeout: 500,
        callbackUrl: 'http://localhost/callback'
      };
      return hlrLookupsProvider
      .processResultReq(req, options)
      .then(function (result) {
        expect(result).to.be.an('object').and.to.be.ok;
        expect(result.done).to.be.a('boolean');
        expect(result.results).to.be.an('array').and.not.to.be.empty;
        result.results.forEach(function (resultItem) {
          expect(resultItem).to.be.an('object').and.to.not.be.empty;
          expect(resultItem.number).to.be.a('string').and.to.be.ok;
          expect(resultItem.mcc).to.be.a('string').and.to.be.ok;
          expect(resultItem.mnc).to.be.a('string').and.to.be.ok;
          expect(resultItem.countryCode).to.be.a('string').and.to.be.ok;
          expect(resultItem.countryName).to.be.a('string').and.to.be.ok;
          expect(resultItem.networkName).to.be.a('string').and.to.be.ok;
          expect(resultItem.extraData).to.be.an('Object').and.to.be.ok;
        });
      });
    });

    it('should process the incoming request with json being string', function () {
      var req = {
        query: {
          id: '12345'
        },
        body: {
          json: JSON.stringify({
            success: true,
            results: [apiResult]
          })
        }
      };

      var options = {
        cache: createSimpleCache(),
        provider: hlrLookupsProvider,
        callbackIdQSParam: 'id', // must match req.query.id
        lookupTimeout: 500,
        callbackUrl: 'http://localhost/callback'
      };
      return hlrLookupsProvider
      .processResultReq(req, options)
      .then(function (result) {
        expect(result).to.be.an('object').and.to.be.ok;
        expect(result.done).to.be.a('boolean');
        expect(result.results).to.be.an('array').and.not.to.be.empty;
        result.results.forEach(function (resultItem) {
          expect(resultItem).to.be.an('object').and.to.not.be.empty;
          expect(resultItem.number).to.be.a('string').and.to.be.ok;
          expect(resultItem.mcc).to.be.a('string').and.to.be.ok;
          expect(resultItem.mnc).to.be.a('string').and.to.be.ok;
          expect(resultItem.countryCode).to.be.a('string').and.to.be.ok;
          expect(resultItem.countryName).to.be.a('string').and.to.be.ok;
          expect(resultItem.networkName).to.be.a('string').and.to.be.ok;
          expect(resultItem.extraData).to.be.an('Object').and.to.be.ok;
        });
      });
    });

    it('should process the incoming request that has no results', function (done) {
      var req = {
        query: {
          id: '12345'
        },
        body: {
          json: JSON.stringify({
            success: true,
            results: []
          })
        }
      };

      var options = {
        cache: createSimpleCache(),
        provider: hlrLookupsProvider,
        callbackIdQSParam: 'id', // must match req.query.id
        lookupTimeout: 500,
        callbackUrl: 'http://localhost/callback'
      };
      hlrLookupsProvider
      .processResultReq(req, options)
      .then(function () {
        done(new Error('Should reject'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.equal('No results in request.');
        done();
      });
    });

    it('should reject if the incoming request does not have unique id qs param', function (done) {
      var req = {
        query: {},
        body: {
          json: {
            success: true,
            results: [{}]
          }
        }
      };

      var options = {
        cache: createSimpleCache(),
        provider: hlrLookupsProvider,
        callbackIdQSParam: 'id',
        lookupTimeout: 500,
        callbackUrl: 'http://localhost/callback'
      };
      hlrLookupsProvider
      .processResultReq(req, options)
      .then(function () {
        done(new Error('It should reject'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(TypeError);
        expect(err.message).to.equal('Unique id must be a valid string');
        done();
      });
    });

    it('should reject if the incoming request does not have results', function (done) {
      var req = {
        query: {
          id: '123'
        },
        body: {
          json: {
            success: true,
            results: []
          }
        }
      };

      var options = {
        cache: createSimpleCache(),
        provider: hlrLookupsProvider,
        callbackIdQSParam: 'id',
        lookupTimeout: 500,
        callbackUrl: 'http://localhost/callback'
      };

      hlrLookupsProvider
      .processResultReq(req, options)
      .then(function () {
        done(new Error('It should reject'));
      })
      .catch(function (err) {
        try {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('No results in request.');
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it('should reject if no arguments', function (done) {
      hlrLookupsProvider
      .processResultReq()
      .then(function () {
        done(new Error('It should reject'));
      })
      .catch(function (err) {
        try {
          expect(err).to.be.instanceOf(Error);
          expect(err.message).to.equal('Input request does no have valid body.json object');
          done();
        } catch (e) {
          done(e);
        }
      });
    });

  });
});