/*jshint -W030 */
var chai = require('chai');
var phoneUtils = require('../../index');
var expect = chai.expect;
var testPhoneNumber = {
  number: '+33892696992',
  regionCode: 'FR'
};

describe('Phone Number Utils', function initialTests() {

  var validatePNUtils = function validatePNUtils(pnUtils) {
    expect(pnUtils).to.have.property('isValid').that.is.a('function');
    expect(pnUtils).to.have.property('isMobile').that.is.a('function');
    expect(pnUtils).to.have.property('toE164').that.is.a('function');
    expect(pnUtils).to.have.property('getType').that.is.a('function');
    expect(pnUtils).to.have.property('getCountryCode').that.is.a('function');
    expect(pnUtils).to.have.property('toNationalNumber').that.is.a('function');
    expect(pnUtils).to.have.property('hlrLookup').that.is.a('function');
    expect(pnUtils).to.have.property('initConfig').that.is.a('function');
    expect(pnUtils).to.have.property('PhoneNumberType').that.is.an('Object').and.is.ok;

    expect(pnUtils.isMobile()).to.be.an.instanceof(Promise);
    expect(pnUtils.isValid()).to.be.an.instanceof(Promise);
    expect(pnUtils.toE164()).to.be.an.instanceof(Promise);
    expect(pnUtils.toNationalNumber()).to.be.an.instanceof(Promise);
    expect(pnUtils.getType()).to.be.an.instanceof(Promise);
    expect(pnUtils.getCountryCode()).to.be.an.instanceof(Promise);
    expect(pnUtils.hlrLookup()).to.be.an.instanceof(Promise);

  };

  it('should have functions that are promises exposed', function checkFunctionsExposed(done) {
    validatePNUtils(phoneUtils);
    done();

  });

  it('should have functions exposed and accept options object argument', function checkFunctionsExposed(done) {
    var pnUtils = require('./../../lib').initConfig({});
    validatePNUtils(pnUtils);
    done();

  });

  describe('isValid', function () {

    it('should check if valid phone number with region code is valid', function (done) {
      phoneUtils
      .isValid(testPhoneNumber.number, testPhoneNumber.regionCode)
      .then(function (result) {
        expect(result).to.equal(true);
        done();
      })
      .catch(done);
    });

    it('should check if valid phone number without region code is valid', function (done) {
      phoneUtils
      .isValid(testPhoneNumber.number)
      .then(function (result) {
        expect(result).to.equal(true);
        done();
      })
      .catch(done);
    });

  });

  describe('isMobile', function () {

    it('should check if valid phone number with region code is mobile', function (done) {
      phoneUtils
      .isMobile(testPhoneNumber.number, testPhoneNumber.regionCode)
      .then(function (result) {
        expect(result).to.be.a('boolean');
        done();
      })
      .catch(done);
    });

    it('should check if valid phone number without region code is valid', function (done) {
      phoneUtils
      .isValid(testPhoneNumber.number)
      .then(function (result) {
        expect(result).to.be.a('boolean');
        done();
      })
      .catch(done);
    });

  });

  describe('getType', function () {

    it('should get type of valid phone number with region code', function (done) {
      phoneUtils
      .getType(testPhoneNumber.number, testPhoneNumber.regionCode)
      .then(function (result) {
        expect(result).to.be.a('number');
        done();
      })
      .catch(done);
    });

    it('should get type of valid phone number without region code', function (done) {
      phoneUtils
      .getType(testPhoneNumber.number)
      .then(function (result) {
        expect(result).to.be.a('number');
        done();
      })
      .catch(done);
    });

  });

});