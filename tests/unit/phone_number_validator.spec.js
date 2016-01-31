var chai = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
var PNValidator = require('../../lib/validators/phone_number_validator');
var PHONE_NUMBERS = require('./../fixtures/phone_numbers.json').phoneNumbers;
var testPhoneNumber = PHONE_NUMBERS[0];

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Phone Number Validator', function () {

  it('should have isValid function exposed', function checkFunctionsExposed(done) {

    expect(PNValidator).to.be.ok;
    expect(PNValidator).to.have.property('isValid').that.is.a('function');
    expect(PNValidator.isValid()).to.be.instanceof(Promise);
    done();

  });

  it('should not allow null input', function checkNotAllowNull(done) {
    expect(PNValidator.isValid(null)).to.eventually.equal(false).and.notify(done);
  });

  it('should not allow empty string input', function checkNotAllowEmptyString(done) {
    expect(PNValidator.isValid('')).to.eventually.equal(false).and.notify(done);
  });

  it('should not allow undefined input', function checkNotAllowUndefined(done) {
    expect(PNValidator.isValid()).to.eventually.equal(false).and.notify(done);
  });

  it('should not allow number input', function checkNotAllowNumber(done) {
    expect(PNValidator.isValid(123)).to.eventually.equal(false).and.notify(done);
  });

  it('should not allow object input', function checkNotAllowObject(done) {
    expect(PNValidator.isValid({})).to.eventually.equal(false).and.notify(done);
  });

  it('should allow string input', function checkAllowString(done) {
    expect(testPhoneNumber).to.be.a('string');
    expect(PNValidator.isValid(testPhoneNumber)).to.eventually.equal(true).and.notify(done);
  });

  it('should allow array input if it consists of non falsy strings', function checkAllowArray(done) {
    //TODO implement this
    //expect(PNValidator.isValid(['123', '223'])).to.eventually.equal(true).and.notify(done);
    done();
  });

  it('should not allow array input if it is mixed', function checkAllowMixedArray(done) {
    expect(PNValidator.isValid(['123', '223', null, {}])).to.eventually.equal(false).and.notify(done);
  });

  describe('Phone number fixtures', function () {

    it('should check if phone number from fixtures is valid', function (done) {
      expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
      expect(PNValidator.isValid(testPhoneNumber)).to.eventually.equal(true).and.notify(done);
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
      var FRANCE_REGION_CODE = '33';
      expect(PNValidator.isValid(testPhoneNumber, FRANCE_REGION_CODE)).to.eventually.equal(true).and.notify(done);
    });

    it('should check if phone number from fixtures with invalid country code is valid', function (done) {
      expect(testPhoneNumber).to.be.a('string').and.to.be.ok;
      var INVALID_REGION_CODE = '0123456789987654321';
      expect(PNValidator.isValid(testPhoneNumber, INVALID_REGION_CODE)).to.eventually.equal(false).and.notify(done);
    });

  });

});