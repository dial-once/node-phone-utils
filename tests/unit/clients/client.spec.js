/*jshint -W030 */

var chai = require('chai');
var winston = require('winston');
winston.level = 'error';
var createClient = require('../../../lib/clients');
var cacheHelper = require('../cache/cache');
var createHLRClient = require('../../mocks/mock-hlr-lookups-client').createClient;
var HLRLookupProvider = require('../../../lib/providers/hlr-lookups-provider');
var keyBuilder = require('../../../lib/cache/key-builder');

var expect = chai.expect;
var PROVIDER_NAME = 'hlr';
var hlrProvider = new HLRLookupProvider(PROVIDER_NAME, 'uname', 'pass', null, createHLRClient());
var faultyClient = createHLRClient({failSetAsyncCallbackUrl: true, logger: winston});
var faultyProvider = new HLRLookupProvider(PROVIDER_NAME, 'uname', 'pass', null, faultyClient);

describe('Clients:', function () {
  it('provides a function to create a new instance of clients', function () {
    expect(createClient).to.be.a('function');
  });

  it('fails if options argument is not provided', function () {
    expect(createClient).to.throw(Error, 'Valid options object must be specified');
  });

  it('creates a client with ability to do async hlr lookup', function () {
    var options = {
      cache: cacheHelper.createSimpleCache(),
      lookupTimeout: 120,
      provider: hlrProvider,
      callbackIdQSParam: 'id'
    };
    var client = createClient(options);
    expect(client).to.be.an('object').and.to.be.ok;
    expect(client).to.to.have.property('hlrLookup').that.is.a('function');
    return client.hlrLookup(['+33892696992'], 'http://lohalhost/callback');
  });

  it('does hlr lookup using callbackUrl from options', function () {
    var options = {
      cache: cacheHelper.createSimpleCache(),
      lookupTimeout: 120,
      provider: hlrProvider,
      callbackIdQSParam: 'id',
      callbackUrl:'http://lohalhost/callback',
      doneCallback: function() {}
    };
    var client = createClient(options);
    expect(client).to.be.an('object').and.to.be.ok;
    expect(client).to.to.have.property('hlrLookup').that.is.a('function');
    return client.hlrLookup(['+33892696992']);
  });

  it('instantly returns async hlr lookup results if in cache', function (done) {
    var cache = cacheHelper.createSimpleCache();
    var options = {
      cache: cache,
      lookupTimeout: 120,
      provider: hlrProvider,
      callbackIdQSParam: 'id',
      doneCallback: function (err, results) {
        try {
          expect(err).to.be.falsy;
          expect(results).to.be.an('array').and.not.to.be.empty;
          results.forEach(function (result) {
            expect(result).to.be.an('object').and.to.be.ok;
            expect(result.number).to.be.oneOf(numbers);
          });
          done();
        } catch (e) {
          done(e);
        }
      }
    };
    var client = createClient(options);
    expect(client).to.be.an('object').and.to.be.ok;
    expect(client).to.to.have.property('hlrLookup').that.is.a('function');
    var numbers = require('../../fixtures/hlr-lookup-responses.json').numbers;
    var cachePromises = numbers.map(function (number) {
      var key = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, number);
      return cache.set(key, {number: number});
    });
    Promise
    .all(cachePromises)
    .then(function () {
      return client.hlrLookup(numbers, 'http://lohalhost/callback');
    })
    .then(function (results) {
      try {
        expect(results).to.be.an('object').and.to.be.ok;
        expect(Object.keys(results)).to.deep.equal(['accepted', 'fromCache', 'rejected']);
        expect(results.accepted).to.be.an('array').and.to.deep.equal(numbers);
        expect(results.fromCache).to.be.an('array').and.to.deep.equal(numbers);
        expect(results.rejected).to.be.an('array').and.to.be.empty;
      } catch (e) {
        done(e);
      }
    })
    .catch(done);
  });

  it('instantly returns async hlr lookup results from in cache without callback', function () {
    var cache = cacheHelper.createSimpleCache();
    var options = {
      cache: cache,
      lookupTimeout: 120,
      provider: hlrProvider,
      callbackIdQSParam: 'id'
    };
    var client = createClient(options);
    expect(client).to.be.an('object').and.to.be.ok;
    expect(client).to.to.have.property('hlrLookup').that.is.a('function');
    var numbers = require('../../fixtures/hlr-lookup-responses.json').numbers;
    var cachePromises = numbers.map(function (number) {
      var key = keyBuilder.buildProcessedCacheKey(PROVIDER_NAME, number);
      return cache.set(key, {number: number});
    });
    return Promise
    .all(cachePromises)
    .then(function () {
      return client.hlrLookup(numbers, 'http://lohalhost/callback');
    })
    .then(function (results) {
        expect(results).to.be.an('object').and.to.be.ok;
        expect(Object.keys(results)).to.deep.equal(['accepted', 'fromCache', 'rejected']);
    });
  });

  it('passes error from the lookup process', function (done) {
    var options = {
      cache: cacheHelper.getCache(),
      lookupTimeout: 120,
      provider: faultyProvider,
      callbackIdQSParam: 'id',
      doneCallback: function (err, results) {
        try {
          expect(err).to.be.instanceOf(Error);
          expect(results).to.be.falsy;
          done();
        } catch (e) {
          done(e);
        }
      }
    };
    var client = createClient(options);
    expect(client).to.be.an('object').and.to.be.ok;
    expect(client).to.to.have.property('hlrLookup').that.is.a('function');
    client
    .hlrLookup(['+33892696992'], 'http://lohalhost/callback')
    .then(function () {
     done(new Error('Should reject'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
    });
  });

  it('passes error from the lookup process without callback', function (done) {
    var options = {
      cache: cacheHelper.getCache(),
      lookupTimeout: 120,
      provider: faultyProvider,
      callbackIdQSParam: 'id'
    };
    var client = createClient(options);
    expect(client).to.be.an('object').and.to.be.ok;
    expect(client).to.to.have.property('hlrLookup').that.is.a('function');
    client
    .hlrLookup(['+33892696992'], 'http://lohalhost/callback')
    .then(function () {
      done(new Error('Should reject'));
    })
    .catch(function (err) {
      expect(err).to.be.instanceOf(Error);
      done();
    });
  });

});
