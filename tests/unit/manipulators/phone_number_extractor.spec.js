/*jshint -W030 */

var chai = require('chai');
var _ = require('lodash');
var PNExtractorBase = require('../../../lib/extractors/phone_number_extractor');
var PNExtractor = PNExtractorBase.createInstance();

var winston = require('winston');
var winstonLogger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({level: 'debug'})
  ]
});

var PHONE_NUMBERS = require('.././../fixtures/phone_numbers.json').phoneNumbers;
var testPhoneNumber = PHONE_NUMBERS[0];

var expect = chai.expect;

describe('Phone Number Extractor', function () {

  describe('getGooglePhoneNumber', function () {

    it('should have getGooglePhoneNumber function exposed and return a promise', function (done) {

      expect(PNExtractor).to.be.ok;
      expect(PNExtractor).to.have.property('getGooglePhoneNumber').that.is.a('function');
      done();

    });

    it('should not allow null input', function () {
      var fn = function () {
        return PNExtractor.getGooglePhoneNumber(null);
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow empty string input', function () {
      var fn = function () {
        return PNExtractor.getGooglePhoneNumber('');
      };
      expect(fn).to.throw(Error);

    });

    it('should not allow undefined input', function () {
      var fn = function () {
        return PNExtractor.getGooglePhoneNumber();
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow number input', function () {
      var fn = function () {
        return PNExtractor.getGooglePhoneNumber(123);
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow object input', function () {
      var fn = function () {
        return PNExtractor.getGooglePhoneNumber({});
      };
      expect(fn).to.throw(TypeError);
    });

    it('should allow string input', function () {
      expect(testPhoneNumber).to.be.a('string');
      expect(PNExtractor.getGooglePhoneNumber(testPhoneNumber)).to.be.an('object').that.is.ok;
    });

    it('should not allow array input if it is mixed', function () {
      var fn = function () {
        return PNExtractor.getGooglePhoneNumber(['123', '223', null, {}]);
      };
      expect(fn).to.throw(TypeError);
    });

    describe('Phone number fixtures', function () {

      it('should check if all numbers from fixtures can be used to get google phone number', function () {

        //last 2 are short numbers aht need country code so are excluded from this test
        var getGPNumber = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (phoneNumber) {
          return PNExtractor.getGooglePhoneNumber(phoneNumber);
        });

        _.each(getGPNumber, function (gPoneNumber) {
          expect(gPoneNumber).to.be.an('Object').that.is.ok;
        });

      });
    });

    describe('With options for logging', function () {

      it('should do logging internally if logger specified by options', function () {
        var pnExtractorWithLogger = PNExtractorBase.createInstance({logger: winstonLogger});
        expect(pnExtractorWithLogger.getGooglePhoneNumber(testPhoneNumber)).to.be.an('object');
      });

    });

  });

  describe('getType', function () {

    var pnTypeValues = _.values(PNExtractor.PhoneNumberType);

    it('should have getType function exposed', function () {

      expect(PNExtractor).to.be.ok;
      expect(PNExtractor).to.have.property('getType').that.is.a('function');

    });

    it('should not allow null input', function () {
      var fn = function () {
        return PNExtractor.getType(null);
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow empty string input', function () {
      var fn = function () {
        return PNExtractor.getType('');
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow undefined input', function () {
      var fn = function () {
        return PNExtractor.getType();
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow number input', function () {
      var fn = function () {
        return PNExtractor.getType(123);
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow object input', function () {
      var fn = function () {
        return PNExtractor.getType({});
      };
      expect(fn).to.throw(Error);
    });

    it('should no allow  arbitrary string input', function () {

      var fn = function () {
        return PNExtractor.getType('string');
      };
      expect(fn).to.throw(Error);
    });

    it('should get type when valid phone number is supplied.', function () {
      expect(testPhoneNumber).to.be.a('string');
      var type = PNExtractor.getType(testPhoneNumber);
      expect(type).to.be.a('number');
      expect(pnTypeValues).to.include(type);
    });

    it('should get type for a range of phone numbers from fixtures', function () {

      var pnExtractor = PNExtractorBase.createInstance({logger: winston});
      var types = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (phoneNumber) {
        return pnExtractor.getType(phoneNumber);
      });

      expect(types).to.be.an('array').and.to.be.ok;

      _.each(types, function (type) {
        expect(type).to.be.a('number');
        expect(pnTypeValues).to.contain(type);
      });

    });

  });

  describe('getCountryCode', function () {

    it('should have getCountryCode function exposed', function (done) {

      expect(PNExtractor).to.be.ok;
      expect(PNExtractor).to.have.property('getCountryCode').that.is.a('function');
      done();

    });

    it('should not allow null input', function () {
      var fn = function () {
        return PNExtractor.getCountryCode(null);
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow empty string input', function () {
      var fn = function () {
        return PNExtractor.getCountryCode('');
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow undefined input', function () {
      var fn = function () {
        return PNExtractor.getCountryCode();
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow number input', function () {
      var fn = function () {
        return PNExtractor.getCountryCode(123);
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow object input', function () {
      var fn = function () {
        return PNExtractor.getCountryCode({});
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow string input bu googlePhoneNumber object', function () {
      expect(testPhoneNumber).to.be.a('string');
      var fn = function () {
        return PNExtractor.getCountryCode('string');
      };
      expect(fn).to.throw(Error);
    });

    it('should get country code when valid  phone number is supplied.', function () {
      expect(testPhoneNumber).to.be.a('string');
      var countryCode = PNExtractor.getCountryCode(testPhoneNumber);
      expect(countryCode).to.be.a('number');
    });

    it('should get country code for a range of phone numbers from fixtures', function () {

      var pnExtractor = PNExtractorBase.createInstance({logger: winston});
      var countryCodes = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (phoneNumber) {
        return pnExtractor.getCountryCode(phoneNumber);
      });

      expect(countryCodes).to.be.an('array').and.to.be.ok;
      _.each(countryCodes, function (countryCode) {
        expect(countryCode).to.be.a('number');
      });
    });

  });
});