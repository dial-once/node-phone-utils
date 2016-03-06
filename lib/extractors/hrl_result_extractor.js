/**
 * A phone number utilities extractor module responsible for extracting data from provider's hrl response and formatting data for output
 * @module hlr-result-extractor
 * @private
 */

var _ = require('lodash');
var getLogger = require('../helpers/logger_options_parser').getLoggerFromOptions;
var loggingFunc = require('../helpers/logger_message_formatter').getLoggerMessageFunc('hrl-result-extractor');

/**
 * Mappings for constructing the hlr response object. Key form this object are taken if there is a match in the value array
 * @private
 */
var RESPONSE_PROP_MAPPINGS = {
  mcc: ['mcc'],
  mnc: ['mnc'],
  number: ['number', 'phone', 'international_format_number', 'msisdn'],
  countryCode: ['country_code', 'msisdncountrycode'],
  countryName: ['country_name', 'originalcountryname'],
  countryPrefix: ['country_prefix', 'originalcountryprefix'],
  originalNetworkName: ['originalnetworkname', 'original_carrier.name', 'info']
};

/**
 * Hlr Response data extractor class suitable for preparing output from hlrLookup functions
 * @private
 * @param logger - a non optional (or facaded) logger;
 * @constructor
 */
var HLRResultExtractor = function HLRResultExtractor(logger) {

  var processObject = function processObject(hlrResultObj, keyPrefix) {
    var returnObj = {
      extraData: {}
    };

    _.forOwn(hlrResultObj, function (value, key) {

      var mappingFound = false;

      if (_.isObject(value) && !_.isEmpty(value)) {
        _.merge(returnObj, processObject(value, key));
        mappingFound = true;

      } else {

        _.forOwn(RESPONSE_PROP_MAPPINGS, function (mappingValues, mappingKey) {

          if (keyPrefix && _.includes(mappingValues, (keyPrefix + '.' + key))) {
            mappingFound = true;
            returnObj[mappingKey] = value;
          } else if (_.includes(mappingValues, key)) {
            returnObj[mappingKey] = value;
            mappingFound = true;
            return false;
          }
        });
      }

      if (!mappingFound) {
        if (keyPrefix && key) {
          returnObj.extraData[keyPrefix] = returnObj.extraData[keyPrefix] || {};

          returnObj.extraData[keyPrefix][key] = value;
        } else {
          returnObj.extraData[key] = value;
        }
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
     * Response mappings is a key, values object used to transform input response data to output response data to be used downstream.
     * The idea is to use this for all providers to have a common output object format.
     * Keys in this object are the keys in output object. Values is array of string where each string represents a key in the response object. The values determine the key to be use don the output object.
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
module.exports.getInstance = function getInstance(options) {
  return new HLRResultExtractor(getLogger(options));
};
