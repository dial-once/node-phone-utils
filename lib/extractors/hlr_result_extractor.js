/**
 * A phone number utilities extractor module responsible for extracting data from provider's hlr response and formatting data for output
 * @module hlr-result-extractor
 * @private
 */

var _ = require('lodash');
var getLogger = require('../helpers/logger_options_parser').getLoggerFromOptions;
var loggingFunc = require('../helpers/logger_message_formatter').getLoggerMessageFunc('hlr-result-extractor');

/**
 * Mappings for constructing the hlr response object. Value form this object represents a key in the output HLR Lookup object
 * @private
 */
var RESPONSE_PROP_MAPPINGS = {
  mcc: 'mcc',
  mnc: 'mnc',
  number: 'number',
  phone: 'number',
  international_format_number: 'number',
  msisdn: 'number',
  country_code: 'countryCode',
  msisdncountrycode: 'countryCode',
  country_name: 'countryName',
  originalcountryname: 'countryName',
  country_prefix: 'countryPrefix',
  originalcountryprefix: 'countryPrefix',
  originalnetworkname: 'networkName',
  'original_carrier.name': 'networkName',
  info: 'networkName'
};

/**
 * Hlr Response data extractor class suitable for preparing output from hlrLookup functions
 * @private
 * @param logger - a non optional (or facaded) logger;
 * @constructor
 */
var HLRResultExtractor = function HLRResultExtractor(logger) {

  var processObject = function processObject(hlrResultObj) {
    var returnObj = {
      extraData: {}
    };

    var usedKeys = [];

    _.forOwn(RESPONSE_PROP_MAPPINGS, function (value, key) {

      if (!_.isNil(value) && !_.isNil(key)) {
        usedKeys.push(key);
        var prop = _.get(hlrResultObj, key);
        if (prop) {
          returnObj[value] = prop;
        }
      }
    });

    _.forOwn(hlrResultObj, function (resultValue, resultKey) {
      if (_.isObject(resultValue)) {

        _.each(resultValue, function (value, key) {

          var testKey = resultKey + '.' + key;
          if (!_.includes(usedKeys, testKey)) {
            _.set(returnObj.extraData, testKey, value);
          }
        });

      } else if (!_.includes(usedKeys, resultKey)) {
        _.set(returnObj.extraData, resultKey, resultValue);
      }

    });

    if (_.isEmpty(returnObj.extraData)) {
      delete returnObj.extraData;
    }
    return returnObj;
  };

  return {

    /**
     * Extracts the data to be forwarded from the response of hlr lookup based on {@type responseMappings} responseMappings
     * @param hlrResponseData {object|object[]} Non null or non empty hlr response result data
     * @returns {Promise} Rejected with Error if Empty object or array or not object or array were supplied. Resolves to an output object whose properties and values are determined by {@type responseMappings}. If the mapping does not cover keys in the input object, those are added ot the special "extraData" property in the output object. If array is supplied, array is returned. Same goes for object.
     */
    extract: function extract(hlrResponseData) {
      return new Promise(function (resolve, reject) {

        var logFmtFunc = loggingFunc('extract');
        logger.info(logFmtFunc('Extracting data from: '), hlrResponseData);

        if (_.isNil(hlrResponseData) || _.isEmpty(hlrResponseData)) {
          var msg = 'Input argument hlrResponseData cannot be null or undefined.';
          var nilErr = new Error(msg);
          logger.error(logFmtFunc(msg), nilErr);
          return reject(nilErr);

        } else {
          if (_.isArray(hlrResponseData) && hlrResponseData.length) {

            var arrayResult = _(hlrResponseData)
            .compact()
            .filter(function (hlrItem) {
              return hlrItem && _.isObject(hlrItem) && !_.isEmpty(hlrItem);
            })
            .map(function (obj) {
              return processObject(obj);
            })
            .value();

            logger.info(logFmtFunc('Resolving data : '), arrayResult);
            return resolve(arrayResult);

          } else if (_.isObject(hlrResponseData) && !_.isEmpty(hlrResponseData)) {
            var objResult = processObject(hlrResponseData);
            logger.info(logFmtFunc('Resolving data : '), objResult);
            return resolve(objResult);
          } else {
            var invalidTypeMsg = 'Input argument hlrResponseData is neither object nor Array of objects';
            var InvalidTypeErr = new Error(invalidTypeMsg);
            logger.error(logFmtFunc(invalidTypeMsg), InvalidTypeErr);
            return reject(InvalidTypeErr);
          }
        }

      });
    },

    /**
     * Response mappings is a key, value object used to transform input response data to output HLR response objects to be used downstream.
     * The idea is to use this for all providers to have a common output object format.
     * Values in this object are the keys in output hlr object.
     * @typedef responseMappings
     */
    responseMappings: RESPONSE_PROP_MAPPINGS
  };

};

/**
 * Gets a new instance of Phone number extractor utility based on supplied options
 * @param [options] {!Object} an options object
 * @returns {HLRResultExtractor} - new instance of phone number extractor
 */
module.exports.createInstance = function createInstance(options) {
  return new HLRResultExtractor(getLogger(options));
};
