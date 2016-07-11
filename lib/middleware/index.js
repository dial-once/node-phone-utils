var _ = require('lodash');
var loggingFunc = require('../logging/logger-message-formatter').getLoggerMessageFunc('hlr-lookup-middleware');
var getLogger = require('../logging/logger-options-parser').getLoggerFromOptions;
var internalLookupNumManager = require('../cache/lookup-numbers-manager');
var internalTimeoutManager = require('../cache/timeout-manager');
var validateOptions = require('../validators/input-validator').validateAsyncLookupOptions;

var INTERNAL_SERVER_ERROR_STATUS_CODE = 500;

/**
 *  Prepares the output and calls next for other middleware. Attaches results and done to req.locals.lookup and  optionally
 *  sends status via res.sendStatus.
 *  req.locals.lookup.results contains the lookups results (array);
 *  req.locals.lookup.done tells if the entire lookup is done or it is an intermediate results
 * @param {Error} err null or the error to be propagated to other middleware
 * @param req request
 * @param res response
 * @param next callback function
 * @param {Boolean} done - is the lookup considered done or not
 * @param {Object|Array<object>}results the results (either all results or intermediate)
 * @param {Boolean} middlewareSend should res.sen be performed
 */
function sendOut(err, req, res, next, done, results, middlewareSend) {
  return new Promise(function (resolve, reject) {
    var callNext = function callNext(error) {
      if (_.isFunction(next)) {
        next(error);
      }
    };

    try {
      if (middlewareSend) {
        // use node.js http response to be compatible with various servers
        if (err) {
          // Giving an unsucess status code would mean for the lookup provider to resend
          res.statusCode = err.statusCode || INTERNAL_SERVER_ERROR_STATUS_CODE;
          res.write(err.message);
        } else {
          res.statusCode = 202;
        }

        res.end();
      }

      // set result for further processing by other middleware
      if (!err) {
        _.set(req, 'locals.lookup.results', results);
        _.set(req, 'locals.lookup.done', done);
      }

      callNext(err);
      resolve(res);
    } catch (e) {
      callNext(e);
      reject(e);
    }
  });
}

function dataToCallbacks(err, options, results, reqId, done) {
  if (_.isFunction(options.resultCallback)) {
    options.resultCallback(err, results, reqId);
  }

  if (done && _.isFunction(options.doneCallback)) {
    options.doneCallback(err, results, reqId);
  }
}

/**
 * Creates middleware for async hlr lookup requests
 * @param {object} options for creating middleware
 * @param {object} [lookupNumbersManager] optional lookup numbers manager to override internal one
 * @param {object} [timeoutMgr] optional timeout manager to override internal one
 * @returns {Function} middlewareFunction
 * @throws {Error}
 */
function hlrLookupsMiddleware(options, lookupNumbersManager, timeoutMgr) {
  validateOptions(options);
  var logger = getLogger(options);
  var doSend = _.isNil(options.middlewareSend) ? true : Boolean(options.middlewareSend);
  var lookupManager = lookupNumbersManager || internalLookupNumManager;
  var timeoutManager = timeoutMgr || internalTimeoutManager;

  return function middlewareFunction(req, res, next) {
    var formatHLRM = loggingFunc('middleware-function');
    var reqId = req.query && req.query[options.callbackIdQSParam];

    if (_.isEmpty(reqId)) {
      var err = new Error('No unique id in request query params. (param:' + options.callbackIdQSParam + ')');
      err.statusCode = 400; // denote a bad request
      logger.error(formatHLRM('Error'), {error: err, reqQuery: req.query, reqPath: req.path});
      return sendOut(err, req, res, next, true, null, doSend)
      .then(function () {
        dataToCallbacks(err, options, null, null, true);
        throw err;
      });
    }

    return options
    .provider
    .processResultReq(req, options)
    .then(function (resultObj) {
      logger.info(formatHLRM('Results received'), resultObj.results);

      var hasDoneCallback = _.isFunction(options.doneCallback);
      var mainPromise;

      if (!resultObj.done) {
        // not done, just giving a result
        mainPromise = Promise.resolve({err: null, results: resultObj.results, done: resultObj.done});
      } else {

        if (hasDoneCallback) {
          mainPromise = lookupManager
          .getLookedUpNumberResults(options.cache, options.provider.name, reqId)
          .then(function (results) {
            // in case the single request could not lookup results in cache
            if (_.isArray(results) && results.length === 0 && resultObj.results) {
              results = resultObj.results;
            }
            // cleanup
            return lookupManager
            .removeLookedUpNumbers(options.cache, options.provider.name, reqId)
            .then(function () {
              // clear timers
              return timeoutManager
              .stopTimeout(reqId, options);
            })
            .then(function () {
              // we got results;
              return {err: null, results: results, done: true};
            });
          });

        } else {
          // no done callback
          mainPromise = lookupManager
          .removeLookedUpNumbers(options.cache, options.provider.name, reqId)
          .then(function () {
            // Clear any timers
            return timeoutManager
            .stopTimeout(reqId, options);
          })
          .then(function () {
            return {err: null, results: resultObj.results, done: resultObj.done};
          });
        }
      }

      return mainPromise
      .then(function (resultObj) {
        return sendOut(resultObj.err, req, res, next, resultObj.done, resultObj.results, doSend)
        .then(function () {
          // notify callbacks
          return dataToCallbacks(resultObj.err, options, resultObj.results, reqId, resultObj.done);
        })
        .catch(function (err) {
          return Promise.reject({err: err, sendCalled: true});
        });
      });

    })
    .catch(function (err) {
      var error;
      var sendCalled = false;
      if (!_.isError(err) && _.isObject(err)) {
        sendCalled = err.sendCalled;
        error = err.err;
      } else {
        error = err;
      }
      logger.error(formatHLRM('Error received after processing result req'), {error: err, uniqueId: reqId});

      var stopTimerAndRethrow = function (thrownErr) {
        return timeoutManager
        .stopTimeout(reqId, options)
        .then(function () {
          dataToCallbacks(thrownErr, options, null, reqId, true);
        })
        .then(function () {
          return Promise.reject(thrownErr);
        });
      };

      res.statusCode = INTERNAL_SERVER_ERROR_STATUS_CODE;
      if (sendCalled) return stopTimerAndRethrow(error);

      return sendOut(error, req, res, next, true, null, doSend)
      .catch(function (sendError) {
        logger.error(formatHLRM('Error while sending response out', {error: sendError, uniqueId: reqId}));
        sendError.sttusCode = INTERNAL_SERVER_ERROR_STATUS_CODE;
        return stopTimerAndRethrow(sendError);
      })
      .then(function () {
        return stopTimerAndRethrow(err);
      });
    });
  };
}

module.exports = hlrLookupsMiddleware;