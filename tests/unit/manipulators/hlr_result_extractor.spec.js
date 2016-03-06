/*jshint -W030 */

var chai = require('chai');
var _ = require('lodash');
var HLRExtractorBase = require('../../../lib/extractors/hrl_result_extractor');

var winston = require('winston');
var winstonLogger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({level: 'debug'})
  ]
});

var HLRResultExtractor = HLRExtractorBase.getInstance({logger: winstonLogger});

var expect = chai.expect;

describe('HRL Result Extractor', function () {

  describe('extract', function () {

    it('should extract result from response result object without extra data', function (done) {

      expect(HLRResultExtractor).to.be.ok;
      var testResponseData = {
        mcc: ' 123',
        mnc: '123',
        phone: '12345678'
      };

      HLRResultExtractor
      .extract(testResponseData)
      .then(function (result) {
        expect(result).to.be.an('object').and.to.be.ok;
        expect(result).to.have.property('mcc', testResponseData.mcc);
        expect(result).to.have.property('mnc', testResponseData.mnc);
        expect(result).to.have.property('number', testResponseData.phone);
        expect(_.keys(result)).to.eql(['mcc', 'mnc', 'number']);
        done();
      })
      .catch(done);

    });

    it('should extract result from response result object with extra data', function (done) {

      expect(HLRResultExtractor).to.be.ok;
      var testResponseData = {
        mcc: ' 123',
        someExtra: 'data'
      };

      HLRResultExtractor
      .extract(testResponseData)
      .then(function (result) {

        expect(result).to.be.an('object').and.to.be.ok;
        expect(result).to.have.property('mcc', testResponseData.mcc);
        expect(result).to.have.property('extraData').that.is.an('object').and.is.ok;
        expect(result.extraData).to.have.property('someExtra', testResponseData.someExtra);
        expect(_.keys(result)).to.eql(['extraData', 'mcc']);
        done();
      })
      .catch(done);

    });

    it('should extract result from response result object with sub object with mapping', function (done) {

      expect(HLRResultExtractor).to.be.ok;
      var testResponseData = {
        mcc: ' 123',
        original_carrier: {
          name: 'test'
        }
      };

      HLRResultExtractor
      .extract(testResponseData)
      .then(function (result) {

        expect(result).to.be.an('object').and.to.be.ok;
        expect(result).to.have.property('mcc', testResponseData.mcc);
        expect(result).to.have.property('originalNetworkName', testResponseData.original_carrier.name);
        expect(_.keys(result)).to.eql(['mcc', 'originalNetworkName']);
        done();
      })
      .catch(done);

    });

    it('should extract result from response result object without sub object (in extraData)', function (done) {

      expect(HLRResultExtractor).to.be.ok;
      var testResponseData = {
        mcc: ' 123',
        some_carrier: {
          name: 'test',
          lname: 'test'
        }
      };

      HLRResultExtractor
      .extract(testResponseData)
      .then(function (result) {

        expect(result).to.be.an('object').and.to.be.ok;
        expect(result).to.have.property('mcc', testResponseData.mcc);
        expect(result).to.have.property('extraData').that.is.an('object').and.is.ok;
        expect(result.extraData).to.have.property('some_carrier').that.is.an('object').and.is.ok;
        expect(result.extraData.some_carrier).to.eql(testResponseData.some_carrier);
        expect(_.keys(result)).to.eql(['extraData', 'mcc']);
        done();
      })
      .catch(done);

    });

    it('should extract result from response result array without extra data', function (done) {

      expect(HLRResultExtractor).to.be.ok;
      var testResponseData = [{
        mcc: ' 123',
        mnc: '123',
        phone: '12345678'
      }];

      HLRResultExtractor
      .extract(testResponseData)
      .then(function (results) {

        expect(results).to.be.an('Array').and.to.have.length(1);
        var result = results[0];
        expect(result).to.have.property('mcc', testResponseData[0].mcc);
        expect(result).to.have.property('mnc', testResponseData[0].mnc);
        expect(result).to.have.property('number', testResponseData[0].phone);
        expect(_.keys(result)).to.eql(['mcc', 'mnc', 'number']);
        done();
      })
      .catch(done);

    });

    it('should extract results from response result array with extra data', function (done) {

      expect(HLRResultExtractor).to.be.ok;
      var testResponseData = [
        {
          mcc: ' 123',
          someExtra: 'data'
        },
        {
          mcc: ' 124',
          someDoubleExtra: 'doubleData'
        },
        null,
        undefined,
        '',
        123,
        {}
      ];

      HLRResultExtractor
      .extract(testResponseData)
      .then(function (results) {

        expect(results).to.be.an('array').and.to.have.length(2);

        _.each(results, function (result, index) {

          expect(result).to.be.an('object').and.to.be.ok;
          expect(result).to.have.property('mcc', testResponseData[index].mcc);
          expect(result).to.have.property('extraData').that.is.an('object').and.is.ok;

          if (index === 0) {
            expect(result.extraData).to.have.property('someExtra', testResponseData[index].someExtra);
          } else {
            expect(result.extraData).to.have.property('someDoubleExtra', testResponseData[index].someDoubleExtra);
          }
          expect(_.keys(result)).to.eql(['extraData', 'mcc']);
        });

        done();
      })
      .catch(done);

    });

    it('should fail if empty object supplied', function (done) {

      HLRResultExtractor
      .extract({})
      .then(done)
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });

    });

    it('should fail if empty array supplied', function (done) {

      HLRResultExtractor
      .extract([])
      .then(done)
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });

    });

    it('should fail if string supplied', function (done) {

      HLRResultExtractor
      .extract('some string')
      .then(done)
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });

    });

    it('should fail if number supplied', function (done) {

      HLRResultExtractor
      .extract(12345)
      .then(done)
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        done();
      });

    });

  });

});