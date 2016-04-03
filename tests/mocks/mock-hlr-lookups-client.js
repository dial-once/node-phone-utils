var chai = require('chai');
var _ = require('lodash');
var url = require('url');
var uuid = require('node-uuid');
var hlrLookupFixtures = require('../fixtures/hlr-lookup-responses.json');

var loggingFunc = require('../../lib/logging/logger-message-formatter').getLoggerMessageFunc('mock-hlr-lookups-client');
var getLogger = require('../../lib/logging/logger-options-parser').getLoggerFromOptions;

chai.use(require('chai-http'));

function simulatePosts(callbackUrl, sampleResponses) {
  var parsedUrl = url.parse(callbackUrl, true, true);
  var baseUrl = parsedUrl.protocol + '//' + parsedUrl.host;
  var request = chai.request(baseUrl);

  var wait = function () {
    return new Promise(function (resolve) {
      _.delay(resolve, 700);
    });
  };

  return Promise
  .all(_.map(sampleResponses, function (resp) {
    return wait().then(function () {
      return request
      .post(parsedUrl.path)
      .set('content-type', 'application/x-www-form-urlencoded') // hlr-lookups.com sends it like this
      .send(resp);
    });
  }));
}

/* Create a fake hlr lookups client used for simulating hlr lookup requests.
 * @type {{callbackUrl: string,
 * setAsyncCallbackUrl: MockHlrLookupClient.setAsyncCallbackUrl,
 * submitAsyncLookupRequest: MockHlrLookupClient.submitAsyncLookupRequest,
 * submitSyncLookupRequest: MockHlrLookupClient.submitSyncLookupRequest}}
 */
module.exports.createClient = function createClient(options) {
  var logger = getLogger(options);
  var failSetAsyncCallbackUrl = options ? Boolean(options.failSetAsyncCallbackUrl) : false;
  var failSubmitAsyncLookupRequest = options ? Boolean(options.failSubmitAsyncLookupRequest) : false;
  var failSubmitAsyncLookupRequestNoRes = options ? Boolean(options.failSubmitAsyncLookupRequestNoRes) : false;
  var failSubmitSyncLookupRequest = options ? Boolean(options.failSubmitSyncLookupRequest) : false;

  return {
    callbackUrl: '',
    setAsyncCallbackUrl: function setAsyncCallbackUrl(responseFunc, callbackUrl) {
      this.callbackUrl = callbackUrl;
      var loggFunc = loggingFunc('set-async-callback-url');
      var response = {
        success: !failSetAsyncCallbackUrl,
        callbackUrl: callbackUrl
      };
      logger.info(loggFunc('Mocking response'), response);
      responseFunc(response);
    },

    submitAsyncLookupRequest: function submitAsyncLookupRequest(responseFunc, numbers) {
      var loggFunc = loggingFunc('submit-async-lookup-request');
      if (failSubmitAsyncLookupRequest) {
        return responseFunc({success: false});
      }
      if (failSubmitAsyncLookupRequestNoRes) {
        return responseFunc({success: true, results: []});
      }
      responseFunc(hlrLookupFixtures.initialResponse);
      numbers = hlrLookupFixtures.numbers;
      logger.info(loggFunc('Using numbers'), numbers);
      logger.info(loggFunc('Mocking response'), hlrLookupFixtures.initialResponse);

      _.delay(simulatePosts, 100, this.callbackUrl, hlrLookupFixtures.responses);
      return numbers;
    },

    submitSyncLookupRequest: function submitSyncLookupRequest(responseFunc, number) {
      var loggFunc = loggingFunc('submit-sync-lookup-request');
      var response = {
        success: !failSubmitSyncLookupRequest,
        results: [
          {
            id: uuid.v4(),
            msisdncountrycode: 'DE',
            msisdn: number,
            statuscode: 'HLRSTATUS_DELIVERED',
            hlrerrorcodeid: null,
            subscriberstatus: 'SUBSCRIBERSTATUS_CONNECTED',
            imsi: '262032000000000',
            mccmnc: '26203',
            mcc: '262',
            mnc: '03',
            msin: '2000000000',
            servingmsc: '491770',
            servinghlr: null,
            originalnetworkname: 'E-Plus',
            originalcountryname: 'Germany',
            originalcountrycode: 'DE',
            originalcountryprefix: '+49',
            originalnetworkprefix: '178',
            roamingnetworkname: null,
            roamingcountryname: null,
            roamingcountrycode: null,
            roamingcountryprefix: null,
            roamingnetworkprefix: null,
            portednetworkname: null,
            portedcountryname: null,
            portedcountrycode: null,
            portedcountryprefix: null,
            portednetworkprefix: null,
            isvalid: 'Yes',
            isroaming: 'No',
            isported: 'No',
            usercharge: '0.0100',
            inserttime: new Date().toISOString(),
            storage: 'SYNC-API-2016-02',
            route: 'IP1',
            interface: 'Sync API'
          }
        ]
      };
      logger.info(loggFunc('Mocking response'), response);
      responseFunc(response);
    }
  };
};