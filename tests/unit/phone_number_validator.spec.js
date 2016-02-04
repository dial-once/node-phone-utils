var chai = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
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

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Phone Number Validator', function () {

  describe('isValid', function () {

    it('should have isValid function exposed', function checkFunctionsExposed(done) {

      expect(PNValidator).to.be.ok;
      expect(PNValidator).to.have.property('isValid').that.is.a('function');
      expect(PNValidator.isValid()).to.be.an.instanceof(Promise);
      done();

    });

    it('should not allow null input', function checkNotAllowNull(done) {
      expect(PNValidator.isValid(null)).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow empty string input', function checkNotAllowEmptyString(done) {
      expect(PNValidator.isValid('')).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow undefined input', function checkNotAllowUndefined(done) {
      return expect(PNValidator.isValid()).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow number input', function checkNotAllowNumber(done) {
      expect(PNValidator.isValid(123)).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow object input', function checkNotAllowObject(done) {
      expect(PNValidator.isValid({})).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should allow string input', function checkAllowString(done) {
      expect(testPhoneNumber).to.be.a('string');
      expect(PNValidator.isValid(testPhoneNumber)).to.eventually.equal(true).notify(done);
    });

    it('should allow array input if it consists of non falsy strings', function checkAllowArray(done) {
      //TODO implement this
      //expect(PNValidator.isValid(['123', '223'])).to.eventually.equal(true).and.notify(done);
      done();
    });

    it('should not allow array input if it is mixed', function checkAllowMixedArray(done) {
      expect(PNValidator.isValid(['123', '223', null, {}])).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    describe('Phone number fixtures', function () {

      it('should check if phone number from fixtures is valid', function (done) {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        expect(PNValidator.isValid(testPhoneNumber)).to.eventually.equal(true).notify(done);
      });

      it('should check if all numbers from fixtures is valid', function (done) {

        //last 2 are short numbers aht need country code so are excluded from this test
        var isValidPromises = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (phoneNumber) {
          return PNValidator.isValid(phoneNumber);
        });

        Promise
        .all(isValidPromises)
        .then(function (valids) {
          _.each(valids, function (isvalidNumber) {
            expect(isvalidNumber).to.equal(true);
          });
          done();
        })
        .catch(done);
      });

      it('should check if phone number from fixtures with country code is valid', function (done) {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        var FRANCE_REGION_CODE = 'FR';
        expect(PNValidator.isValid(testPhoneNumber, FRANCE_REGION_CODE)).to.eventually.equal(true).notify(done);
      });

      it('should check if valid phone number from fixtures with invalid country code is valid', function (done) {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        var INVALID_REGION_CODE = '---';
        expect(PNValidator.isValid('700', INVALID_REGION_CODE)).to.eventually.be.rejectedWith(Error).notify(done);
      });

      it('should check if valid phone number from fixtures with invalid country code type is valid', function (done) {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        var INVALID_REGION_CODE = 0123456789987654321;
        expect(PNValidator.isValid(testPhoneNumber + '1111111', INVALID_REGION_CODE)).to.eventually.equal(false).notify(done);
      });

    });

    describe('With options', function () {

      it('should do logging internally if logger specified by options', function (done) {
        var pnValidatorWithLogger = PNValidatorBase.getInstance({logger: winstonLogger});
        expect(pnValidatorWithLogger.isValid(testPhoneNumber)).to.eventually.equal(true).notify(done);
      });

      it('should do logging internally if logger specified by options and countryCode', function (done) {
        var pnValidatorWithLogger = PNValidatorBase.getInstance({logger: winstonLogger});
        expect(pnValidatorWithLogger.isValid(testPhoneNumber, 'FR')).to.eventually.equal(true).notify(done);
      });

    });

  });

  describe('isMobile', function () {

    it('should have isMobile function exposed', function checkFunctionsExposed(done) {

      expect(PNValidator).to.be.ok;
      expect(PNValidator).to.have.property('isMobile').that.is.a('function');
      expect(PNValidator.isMobile()).to.be.an.instanceof(Promise);
      done();

    });

    it('should not allow null input', function checkNotAllowNull(done) {
      expect(PNValidator.isMobile(null)).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow empty string input', function checkNotAllowEmptyString(done) {
      expect(PNValidator.isValid('')).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow undefined input', function checkNotAllowUndefined(done) {
      return expect(PNValidator.isMobile()).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow number input', function checkNotAllowNumber(done) {
      expect(PNValidator.isMobile(123)).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow object input', function checkNotAllowObject(done) {
      expect(PNValidator.isMobile({})).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should allow string input', function checkAllowString(done) {
      expect(testPhoneNumber).to.be.a('string');
      expect(PNValidator.isMobile(testMobilePhoneNumber)).to.eventually.be.a('Boolean').and.equal(true).notify(done);
    });

    it('should allow array input if it consists of non falsy strings', function checkAllowArray(done) {
      //TODO implement this
      //expect(PNValidator.isMobile(['123', '223'])).to.eventually.equal(true).and.notify(done);
      done();
    });

    it('should not allow array input if it is mixed', function checkAllowMixedArray(done) {
      expect(PNValidator.isMobile(['123', '223', null, {}])).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    describe('With Fixtures', function () {
      it('should check if phone number from fixtures is mobile', function (done) {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        expect(PNValidator.isMobile(testPhoneNumber)).to.eventually.equal(false).notify(done);
      });

      it('should check if all numbers from fixtures is mobile', function (done) {

        //last 2 are short numbers aht need country code so are excluded from this test
        var isMobilePromises = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (phoneNumber) {
          return PNValidator.isMobile(phoneNumber);
        });

        Promise
        .all(isMobilePromises)
        .then(function (valids) {
          _.each(valids, function (isMobileNumber) {
            expect(isMobileNumber).to.be.a('boolean');
          });
          done();
        })
        .catch(done);
      });

      it('should check if phone number from fixtures with country code is mobile', function (done) {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        var FRANCE_REGION_CODE = 'FR';
        expect(PNValidator.isMobile(testPhoneNumber, FRANCE_REGION_CODE)).to.eventually.equal(false).notify(done);
      });

      it('should check if valid phone number from fixtures with invalid country code is mobilr', function (done) {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        var INVALID_REGION_CODE = '---';
        expect(PNValidator.isMobile('700', INVALID_REGION_CODE)).to.eventually.be.rejectedWith(Error).notify(done);
      });

      it('should check if valid phone number from fixtures with invalid country code type is mobile', function (done) {
        expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
        var INVALID_REGION_CODE = 0123456789987654321;
        expect(PNValidator.isMobile(testPhoneNumber + '1111111', INVALID_REGION_CODE)).to.eventually.be.rejectedWith(Error).notify(done);
      });

    });
  });
});