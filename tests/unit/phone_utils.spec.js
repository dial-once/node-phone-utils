/*jshint -W030 */
var chai = require('chai');
var phoneUtils = require('../../lib');
var expect = chai.expect;
var testPhoneNumber = {
  number: '+33892696992',
  regionCode: 'FR',
  countryCode: 33
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

    it('should check if valid phone number with region code is valid', function () {
      expect(phoneUtils.isValid(testPhoneNumber.number, testPhoneNumber.regionCode)).to.equal(true);
    });

    it('should check if valid phone number without region code is valid', function () {
      expect(phoneUtils.isValid(testPhoneNumber.number)).to.equal(true);
    });

  });

  describe('isMobile', function () {

    it('should check if valid phone number with region code is mobile', function () {
      expect(phoneUtils.isMobile(testPhoneNumber.number, testPhoneNumber.regionCode)).to.be.a('boolean');
    });

    it('should check if valid phone number without region code is valid', function () {
      expect(phoneUtils.isValid(testPhoneNumber.number)).to.be.a('boolean');
    });

  });

  describe('getType', function () {

    it('should get type of valid phone number with region code', function () {
      expect(phoneUtils.getType(testPhoneNumber.number, testPhoneNumber.regionCode)).to.be.a('number');
    });

    it('should get type of valid phone number without region code', function () {
      expect(phoneUtils.getType(testPhoneNumber.number)).to.be.a('number');
    });

  });

  describe('getCountryCode', function () {

    it('should get country code of valid phone number', function () {
      expect(phoneUtils.getCountryCode(testPhoneNumber.number)).to.be.a('number').and.to.equal(testPhoneNumber.countryCode);
    });

    it('should not get country code of invalid valid phone number', function () {
      var fn = function () {
        return phoneUtils.getCountryCode('7700');
      };

      expect(fn).to.throw(Error);
    });

  });

});