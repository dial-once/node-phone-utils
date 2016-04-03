var uuid = require('node-uuid');
var loggingFunc = require('../../lib/logging/logger-message-formatter').getLoggerMessageFunc('mock-sms-api-client');
var getLogger = require('../../lib/logging/logger-options-parser').getLoggerFromOptions;

/**
 * A mock sms api client that gets mock data
 * @param {object} [options] optional to get the logger from
 * @returns {{authentication: {loginHashed: authentication.loginHashed}, hlr: {check: hlr.check}}}
 */
module.exports.createClient = function createClient(options) {
  var logger = getLogger(options);
  var failOnExec = options ? Boolean(options.failOnExec) : false;
  var err = options && options.error ? options.error : new Error ('Fail as requested by options.failOnExec param');

  return {
    authentication: {
      loginHashed: function () {
        return Promise.resolve(true);
      }
    },
    hlr: {
      check: function () {
        return {
          number: function number(pNumber){
            return {
              execute: function execute(){
                if (failOnExec) {
                  return Promise.reject(err);
                }
                var loggFunc = loggingFunc('execute');
                var response = {
                  id : uuid.v4(),
                  number : pNumber,
                  mcc : '262',
                  mnc : '03',
                  status : 'OK',
                  date : Date.now(),
                  ported : null,
                  ported_from : null
                };

                logger.info(loggFunc('Mocking response', response));
                return Promise.resolve(response);
              }
            };
          }
        };
      }
    }
  };
};