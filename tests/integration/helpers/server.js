require('dotenv').config({ silent: true });
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var errorHandler = require('api-error-handler');
var HLRLookupsProvider = require('../../../lib/providers/hlr-lookups-provider');
var createLookupMockClient = require('../../mocks/mock-hlr-lookups-client').createClient;
//Take a list of numbers from a fixture
//var BIG_NUMBERS_LIST = require('../../fixtures/phone-numbers-big.json').phoneNumbers;
// numbers only in mock
var BIG_NUMBERS_LIST = ['+33892696992', '+3857811375206', '+16502821370', '+33644125380', '+33644125390'];

var cacheManager = require('cache-manager');
// cache for six months
var TTL = 5778463;
/*seconds*/

// Uncomment to use REDIS as cache store
/*
 var redisStore = require('cache-manager-redis');
 var redisCacheConfig = {
 store: redisStore,
 host: 'localhost', // default value
 port: 6379, // default value
 auth_pass: '',
 db: 0,
 ttl: TTL,
 promiseDependency: Promise
 };
 var cacheStore = cacheManager.multiCaching([cacheManager.caching(redisCacheConfig)]);
 */

// comment if using another store
var cacheStore = cacheManager.multiCaching([cacheManager.caching({
  store: 'memory',
  max: 2 * BIG_NUMBERS_LIST.length,
  ttl: TTL
})]);

var phoneUtilsBase = require('../../../lib');

var DEFAULT_PORT = 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var winston = require('winston');
var LOG_LEVEL = 'error';
winston.level = LOG_LEVEL;

var winstonHlrLookupLogger = new winston.Logger({
  level: LOG_LEVEL,
  transports: [
    new (winston.transports.Console)()
  ]
});

var phoneUtils = phoneUtilsBase.createInstance({logger: winstonHlrLookupLogger});

var options = {
  provider: new HLRLookupsProvider('hlr-lookups', 'test', 'test', winstonHlrLookupLogger, createLookupMockClient({logger: winstonHlrLookupLogger})),  // to use a real client use phoneUtils.getProviders().hlrLookups,
  logger: winstonHlrLookupLogger,
  callbackUrl: 'http: //localhost:' + DEFAULT_PORT + '/hlr/callback',
  callbackIdQSParam: 'id',
  middlewareSend: true, // override (default true) if you wish to do a res.send in some other middleware
  cache: cacheStore,
  lookupTimeout: 30,  //seconds
  resultCallback: function (err, results) {
    //a result was processed and available
    winstonHlrLookupLogger.info('resultCallback', err, results);
    return results;
  },
  doneCallback: function (err, results, reqId) {
    // do what you need when the entire lookup is done.
    winstonHlrLookupLogger.info('doneCallback', err, reqId, results);
    return results;
  }
};

var utils = phoneUtils.getAsyncHlrLookup(options);
var client = utils.lookupClient;
var callbackMiddleware = utils.lookupMiddleware;

var expressWinston = require('express-winston');

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true,
      level: LOG_LEVEL
    })
  ]
}));

app.get('/ping', function (req, res, next) {
  res.sendStatus(200).json({pong: Date.now()});
  next();
});

app.post('/hlr/lookup', function (req, res, next) {
  var phoneNumbers = req.body.numbers;

  if (phoneNumbers && phoneNumbers.length > 0) {
    winstonHlrLookupLogger.info('numbers', phoneNumbers);

    client
    .hlrLookup(phoneNumbers, options.callbackUrl, req.body.unid)
    .then(function (numbers) {
      winstonHlrLookupLogger.debug('Numbers sent to hlr processing', numbers);
      res.json(numbers);
      return next();
    })
    .catch(next);
  } else {
    res.sendStatus(400);
    next();
  }
});

app.post('/hlr/callback', callbackMiddleware, function (req, res, next) {
  // results passed in from callbackMiddleware
  winstonHlrLookupLogger.info('req.locals.lookup.done', {done: req.locals.lookup.done});
  var results = req.locals.lookup.results;
  winstonHlrLookupLogger.info('req.locals.lookup.results', {resultNum: results.length, results: results});
  next();
});

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ]
}));

app.use(errorHandler());

var server;

module.exports.getCache = function getCache() {
  return options.cache;
};

module.exports.setDoneCallback = function setDoneCallback(cb) {
  options.doneCallback = cb;
};

module.exports.startServer = function startServer(port, cb) {
  if (!server) {
    var serverPort = port || DEFAULT_PORT;
    server = app.listen(serverPort, function () {
      winstonHlrLookupLogger.info('Server listening on port %s', serverPort);
      if (typeof cb === 'function') {
        cb();
      }
    });
  }

};

module.exports.stopServer = function stopServer(cb) {
  server.close(function(){
    winstonHlrLookupLogger.info('Server stopped');
    if (typeof cb === 'function') {
      cb();
    }
  });
};
