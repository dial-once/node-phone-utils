/*jshint -W030 */
var chai = require('chai');
var _ = require('lodash');
var PNValidatorBase = require('../../lib/validators/phone_number_validator');
var PNValidator = PNValidatorBase.getInstance();

var winston = require('winston');
var winstonLogger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({level: 'silly'})
  ]
});

var PHONE_NUMBERS = require('./../fixtures/phone_numbers.json').phoneNumbers;
var testPhoneNumber = PHONE_NUMBERS[0];
var testMobilePhoneNumber = '+31612969525';

var expect = chai.expect;

describe('Phone Number Validator', function () {

  describe('isValid', function () {

    it('should have isValid function exposed', function (done) {

      expect(PNValidator).to.be.ok;
      expect(PNValidator).to.have.property('isValid').that.is.a('function');
      done();

    });

    it('should not allow null input', function () {
      var fn = function () {
        return PNValidator.isValid(null);
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow empty string input', function () {
      var fn = function () {
        return PNValidator.isValid('');
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow undefined input', function () {
      var fn = function () {
        return PNValidator.isValid();
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow number input', function () {
      var fn = function () {
        return PNValidator.isValid(123);
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow object input', function () {
      var fn = function () {
        return PNValidator.isValid({});
      };
      expect(fn).to.throw(TypeError);
    });

    it('should allow string input', function () {
      expect(testPhoneNumber).to.be.a('string');
      expect(PNValidator.isValid(testPhoneNumber)).to.equal(true);
    });

    it('should not allow array input if it is mixed', function () {
      var fn = function () {
        return PNValidator.isValid(['123', '223', null, {}]);
      };
      expect(fn).to.throw(TypeError);
    });

    describe('Phone number fixtures', function () {

      it('should check if phone number from fixtures is valid', function () {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        expect(PNValidator.isValid(testPhoneNumber)).to.equal(true);
      });

      it('should check if all numbers from fixtures is valid', function () {

        //last 2 are short numbers aht need country code so are excluded from this test
        var isValids = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), PNValidator.isValid);

        _.each(isValids, function (isvVlidNumber) {
          expect(isvVlidNumber).to.equal(true);
        });

        it('should check if phone number from fixtures with country code is valid', function () {
          expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
          var FRANCE_REGION_CODE = 'FR';
          expect(PNValidator.isValid(testPhoneNumber, FRANCE_REGION_CODE)).to.equal(true);
        });

        it('should check if valid phone number from fixtures with invalid country code is valid', function () {
          expect(testPhoneNumber).to.be.a('string').and.to.be.ok;

          var fn = function () {
            var INVALID_REGION_CODE = '---';
            return PNValidator.isValid('700', INVALID_REGION_CODE);
          };
          expect(fn).to.throw(Error);

        });

        it('should check if valid phone number from fixtures with invalid country code type is valid', function () {
          expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
          var INVALID_REGION_CODE = 0123456789987654321;
          expect(PNValidator.isValid(testPhoneNumber + '1111111', INVALID_REGION_CODE)).to.equal(false);
        });

      });

    });

    describe('With options', function () {

      it('should do logging internally if logger specified by options', function () {
        var pnValidatorWithLogger = PNValidatorBase.getInstance({logger: winstonLogger});
        expect(pnValidatorWithLogger.isValid(testPhoneNumber)).to.equal(true);
      });

      it('should do logging internally if logger specified by options and countryCode', function () {
        var pnValidatorWithLogger = PNValidatorBase.getInstance({logger: winstonLogger});
        expect(pnValidatorWithLogger.isValid(testPhoneNumber, 'FR')).to.equal(true);
      });

    });

  });

  describe('isMobile', function () {

    it('should have isMobile function exposed', function () {

      expect(PNValidator).to.be.ok;
      expect(PNValidator).to.have.property('isMobile').that.is.a('function');
    });

    it('should not allow null input', function () {
      var fn = function() {
        return PNValidator.isMobile(null);
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow empty string input', function () {

      var fn = function() {
        return PNValidator.isMobile('');
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow undefined input', function () {
      var fn = function() {
        return PNValidator.isMobile();
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow number input', function () {
      var fn = function() {
        return PNValidator.isMobile(123);
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow object input', function () {
      var fn = function() {
        return PNValidator.isMobile({});
      };
      expect(fn).to.throw(TypeError);
    });

    it('should allow string input', function () {
      expect(testPhoneNumber).to.be.a('string');
      expect(PNValidator.isMobile(testMobilePhoneNumber)).to.be.true;
    });

    it('should not allow array input if it is mixed', function () {
      var fn = function() {
        return PNValidator.isMobile(['123', '223', null, {}]);
      };
      expect(fn).to.throw(TypeError);
    });

    describe('With Fixtures', function () {
      it('should check if phone number from fixtures is mobile', function () {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        expect(PNValidator.isMobile(testPhoneNumber)).to.equal(false);
      });

      it('should check if all numbers from fixtures is mobile', function () {

        //last 2 are short numbers that are excluded from this test
        var isMobiles = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (pNumber) {
          return PNValidator.isMobile(pNumber);
        });
        _.each(isMobiles, function (isMobileNumber) {
          expect(isMobileNumber).to.be.a('boolean');
        });
      });

      it('should check if phone number from fixtures with country code is mobile', function () {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        var FRANCE_REGION_CODE = 'FR';
        expect(PNValidator.isMobile(testPhoneNumber, FRANCE_REGION_CODE)).to.equal(false);
      });

      it('should check if valid phone number from fixtures with invalid country code is mobile', function () {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        var fn = function () {
          var INVALID_REGION_CODE = '---';
          PNValidator.isMobile('700', INVALID_REGION_CODE);
        };

        expect(fn).to.throw(Error);
      });

      it('should check if valid phone number from fixtures with invalid country code type is mobile', function () {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;

        var fn = function () {
          var INVALID_REGION_CODE = 0123456789987654321;
          return PNValidator.isMobile(testPhoneNumber + '1111111', INVALID_REGION_CODE);
        };

        expect(fn).to.throw(Error);
      });

    });
  });
});