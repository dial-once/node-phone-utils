/*jshint -W030 */

var _ = require('lodash');
var chai = require('chai');
var phoneUtilsBase = require('../../lib');
var phoneUtils = phoneUtilsBase.createInstance();
var expect = chai.expect;
var PHONE_NUMBERS = require('./../fixtures/phone-numbers.json').phoneNumbers;
var NATIONAL_PHONE_NUMBERS = require('./../fixtures/phone-numbers-national.json').phoneNumbers;
var testPhoneNumber = {
  number: '+33892696992',
  regionCode: 'FR',
  countryCode: 33,
  e164Form: '+33892696992',
  nationalNumberForm: '0 892 69 69 92'
};

var testMobilePhoneNumber = {
  number: '+33620876194',
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
    expect(pnUtils).to.not.have.property('init').that.is.a('function');
    expect(pnUtils).to.have.property('getVersion').that.is.a('function');
    expect(pnUtils).to.have.property('PhoneNumberType').that.is.an('Object').and.is.ok;
  };

  it('should have functions exposed', function () {
    validatePNUtils(phoneUtils);
  });

  describe('isValid', function () {

    it('should check if valid phone number with region code is valid', function () {
      expect(phoneUtils.isValid(testPhoneNumber.number, testPhoneNumber.regionCode)).to.equal(true);
    });

    it('should check if valid phone number without region code is valid', function () {
      expect(phoneUtils.isValid(testPhoneNumber.number)).to.equal(true);
    });

    var arePhoneNumbersValid = function arePhoneNumbersValid(phoneNumbers, regionCode) {
      var numbers = phoneUtils.isValid(phoneNumbers, regionCode);
      expect(numbers).to.be.an('array').and.to.be.ok;

      _.each(numbers, function (number) {
        expect(number).to.be.an('object');
        if (number.hasOwnProperty('isValid')) {
          expect(number.isValid).to.be.a('boolean');
          expect(number.number).to.be.a('string').that.is.ok;
          expect(phoneNumbers).to.contain(number.number);
        } else {
          expect(number.isError).to.be.true;
          expect(number.error).to.be.an.instanceOf(Error);
        }
      });

      return numbers;
    };

    it('should check if array of telephone numbers are valid', function () {
      arePhoneNumbersValid(PHONE_NUMBERS);
    });

    it('should check if array of telephone numbers are valid with region code', function () {
      arePhoneNumbersValid(PHONE_NUMBERS, 'FR');
    });

    it('should check if array of telephone numbers are valid with invalid region code', function () {
      arePhoneNumbersValid(PHONE_NUMBERS, 'FR--123-321');
    });

    it('should check if array of national formatted telephone numbers are valid with regionCode', function () {
      arePhoneNumbersValid(NATIONAL_PHONE_NUMBERS, 'FR');
    });

    it('should check if empty array of telephone numbers are valid', function () {
      var fn = function () {
        return phoneUtils.isValid([]);
      };
      expect(fn).to.throw(Error);
    });

  });

  describe('isMobile', function () {

    var arePhoneNumbersMobile = function arePhoneNumbersMobile(phoneNumbers, regionCode) {
      var numbers = phoneUtils.isMobile(phoneNumbers, regionCode);
      expect(numbers).to.be.an('array').and.to.be.ok;

      _.each(numbers, function (number) {
        expect(number).to.be.an('object');
        if (number.hasOwnProperty('isMobile')) {
          expect(number.isMobile).to.be.a('boolean');
          expect(number.number).to.be.a('string').that.is.ok;
          expect(phoneNumbers).to.contain(number.number);
        } else {
          expect(number.isError).to.be.true;
          expect(number.error).to.be.an.instanceOf(Error);
        }
      });

      return numbers;
    };

    it('should check if valid phone number with region code is mobile', function () {
      expect(phoneUtils.isMobile(testPhoneNumber.number, testPhoneNumber.regionCode)).to.be.a('boolean');
    });

    it('should check if valid mobile phone number with region code is mobile', function () {
      expect(phoneUtils.isMobile(testMobilePhoneNumber.number, testMobilePhoneNumber.regionCode)).to.be.true;
    });

    it('should check if valid phone number without region code is valid', function () {
      expect(phoneUtils.isValid(testPhoneNumber.number)).to.be.a('boolean');
    });

    it('should check if empty array of telephone numbers are mobile', function () {
      var fn = function () {
        return phoneUtils.isMobile([]);
      };
      expect(fn).to.throw(Error);
    });

    it('should check if array of telephone numbers are mobile', function () {
      arePhoneNumbersMobile(PHONE_NUMBERS);
    });

    it('should check if array of telephone numbers are mobile with region code', function () {
      arePhoneNumbersMobile(PHONE_NUMBERS, 'FR');
    });

    it('should check if array of telephone numbers are mobile with invalid region code', function () {
      arePhoneNumbersMobile(PHONE_NUMBERS, 'FR--123-321');
    });

  });

  describe('getType', function () {

    it('should get type of valid phone number with region code', function () {
      expect(phoneUtils.getType(testPhoneNumber.number, testPhoneNumber.regionCode)).to.be.a('number');
    });

    it('should get type of valid mobile phone number to be mobile', function () {
      expect(phoneUtils.getType(testMobilePhoneNumber.number, testMobilePhoneNumber.regionCode)).to.be.a('number').and.to.eql(phoneUtils.PhoneNumberType.MOBILE);
    });

    it('should get type of valid Brazil mobile phone number to be mobile', function () {
      expect(phoneUtils.getType('+5541987960672')).to.be.a('number').and.to.eql(phoneUtils.PhoneNumberType.MOBILE);
    });

    it('should get type of valid phone number without region code', function () {
      expect(phoneUtils.getType(testPhoneNumber.number)).to.be.a('number');
    });

    var validatePNTypes = function validatePNTypes(phoneNumbers, regionCode) {
      var types = phoneUtils.getType(phoneNumbers, regionCode);
      expect(types).to.be.an('array').and.to.be.ok;

      _.each(types, function (type) {
        expect(type).to.be.an('object');
        if (type.hasOwnProperty('type')) {
          expect(type.type).to.be.a('number');
          expect(_.values(phoneUtils.PhoneNumberType)).to.contain(type.type);
          expect(type.number).to.be.a('string').that.is.ok;
          expect(phoneNumbers).to.contain(type.number);
        } else {
          expect(type.isError).to.be.true;
          expect(type.error).to.be.an.instanceOf(Error);
        }
      });

      return types;
    };

    it('should check if empty array of telephone number could be used to get type', function () {
      var fn = function () {
        return phoneUtils.getType([]);
      };
      expect(fn).to.throw(Error);
    });

    it('should check if getType supports array of telephone numbers', function () {
      validatePNTypes(PHONE_NUMBERS);
    });

    it('should check if getType supports array of telephone numbers with region code', function () {
      validatePNTypes(PHONE_NUMBERS, 'FR');
    });

    it('should check if getType supports array of telephone numbers with invalid region code', function () {
      validatePNTypes(PHONE_NUMBERS, 'FR--123-321');
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

    var validateCountryCodes = function validateCountryCodes(phoneNumbers, regionCode) {

      var cCodes = phoneUtils.getCountryCode(phoneNumbers, regionCode);
      expect(cCodes).to.be.an('array').and.to.be.ok;

      _.each(cCodes, function (cCodeObj) {
        expect(cCodeObj).to.be.an('object');
        if (cCodeObj.hasOwnProperty('countryCode')) {
          expect(cCodeObj.countryCode).to.be.a('number');
          expect(cCodeObj.number).to.be.a('string').that.is.ok;
          expect(phoneNumbers).to.contain(cCodeObj.number);
        } else {
          expect(cCodeObj.isError).to.be.true;
          expect(cCodeObj.error).to.be.an.instanceOf(Error);
        }
      });

      return cCodes;
    };

    it('should check if empty array of telephone number could be used to get country code', function () {
      var fn = function () {
        return phoneUtils.getCountryCode([]);
      };
      expect(fn).to.throw(Error);
    });

    it('should check if getCountryCode supports array of telephone numbers', function () {
      validateCountryCodes(PHONE_NUMBERS);
    });

    it('should check if getCountryCode supports array of telephone numbers with region code', function () {
      validateCountryCodes(PHONE_NUMBERS, 'FR');
    });

    it('should check if getCountryCode supports array of telephone numbers with invalid region code', function () {
      validateCountryCodes(PHONE_NUMBERS, 'FR--123-321,la');
    });

  });

  describe('toE164', function () {

    it('should get e164 representation of valid phone number', function () {
      expect(phoneUtils.toE164(testPhoneNumber.number)).to.be.a('string').and.to.equal(testPhoneNumber.e164Form);
    });

    it('should not get e164 representation of invalid valid phone number', function () {
      var fn = function () {
        return phoneUtils.toE164('7700');
      };

      expect(fn).to.throw(Error);
    });

    var validateE164Transforms = function validateE164Transforms(phoneNumbers, regionCode) {

      var e164Numbers = phoneUtils.toE164(phoneNumbers, regionCode);
      expect(e164Numbers).to.be.an('array').and.to.be.ok;

      _.each(e164Numbers, function (e164NumberObj) {
        expect(e164NumberObj).to.be.an('object');
        if (e164NumberObj.hasOwnProperty('e164')) {
          expect(e164NumberObj.e164).to.be.a('string').that.is.ok;
          expect(e164NumberObj.number).to.be.a('string').that.is.ok;
          expect(phoneNumbers).to.contain(e164NumberObj.number);
        } else {
          expect(e164NumberObj.isError).to.be.true;
          expect(e164NumberObj.error).to.be.an.instanceOf(Error);
        }
      });

      return e164Numbers;
    };

    it('should check if empty array of telephone number could be used to get country code', function () {
      var fn = function () {
        return phoneUtils.toE164([]);
      };
      expect(fn).to.throw(Error);
    });

    it('should check if toE164 supports array of telephone numbers', function () {
      validateE164Transforms(PHONE_NUMBERS);
    });

    it('should check if toE164 supports array of telephone numbers with region code', function () {
      validateE164Transforms(PHONE_NUMBERS, 'FR');
    });

    it('should check if toE164 supports array of telephone numbers with invalid region code', function () {
      validateE164Transforms(PHONE_NUMBERS, 'FR--123-321,la');
    });

  });

  describe('toNationalNumber', function () {

    it('should get national number representation of valid phone number', function () {
      expect(phoneUtils.toNationalNumber(testPhoneNumber.number)).to.be.a('string').and.to.equal(testPhoneNumber.nationalNumberForm);
    });

    it('should not get national number representation of invalid valid phone number', function () {
      var fn = function () {
        return phoneUtils.toE164('7700');
      };

      expect(fn).to.throw(Error);
    });

    var validateNationalNumberTransforms = function validateNationalNumberTransforms(phoneNumbers, regionCode) {

      var nationalNumbers = phoneUtils.toNationalNumber(phoneNumbers, regionCode);
      expect(nationalNumbers).to.be.an('array').and.to.be.ok;

      _.each(nationalNumbers, function (nationalNumberObj) {
        expect(nationalNumberObj).to.be.an('object').and.to.be.ok;
        if (nationalNumberObj.hasOwnProperty('nationalNumber')) {
          expect(nationalNumberObj.nationalNumber).to.be.a('string').that.is.ok;
          expect(nationalNumberObj.number).to.be.a('string').that.is.ok;
          expect(phoneNumbers).to.contain(nationalNumberObj.number);
        } else {
          expect(nationalNumberObj.isError).to.be.true;
          expect(nationalNumberObj.error).to.be.an.instanceOf(Error);
        }
      });

      return nationalNumbers;
    };

    it('should check if empty array of telephone number could be used to get country code', function () {
      var fn = function () {
        return phoneUtils.toNationalNumber([]);
      };
      expect(fn).to.throw(Error);
    });

    it('should check if toE164 supports array of telephone numbers', function () {
      validateNationalNumberTransforms(PHONE_NUMBERS);
    });

    it('should check if toE164 supports array of telephone numbers with region code', function () {
      validateNationalNumberTransforms(PHONE_NUMBERS, 'FR');
    });

    it('should check if toE164 supports array of telephone numbers with invalid region code', function () {
      validateNationalNumberTransforms(PHONE_NUMBERS, 'FR--123-321,la');
    });

  });

  describe('getVersion', function () {

    it('should expose a version', function () {
      expect(phoneUtils.getVersion()).to.be.a('string').and.to.be.ok;
    });

  });

  describe('createInstance', function () {

    it('should have functions exposed and accept options object argument for createInstance', function () {
      var pnUtils = require('./../../lib').createInstance({});
      validatePNUtils(pnUtils);
    });

    it('should ignore falsy values', function () {
      require('./../../lib').createInstance(false);
      require('./../../lib').createInstance('');
      require('./../../lib').createInstance(null);
      require('./../../lib').createInstance();
      require('./../../lib').createInstance(0);
    });

    it('should throw error if not object supplied for options argument', function () {
      var fn = function () {
        require('./../../lib').createInstance(123);
      };
      expect(fn).to.throw(Error);
      fn = function () {
        require('./../../lib').createInstance('123');
      };
      expect(fn).to.throw(Error);
      fn = function () {
        require('./../../lib').createInstance([123]);
      };
      expect(fn).to.throw(Error);

    });

  });

  describe('getProviders', function () {

    it('should get built in providers', function () {
      var providers = phoneUtils.getProviders();
      expect(providers).to.be.an('object').and.to.be.ok;
      expect(providers).to.have.property('hlrLookups').and.to.be.ok;
      expect(providers.smsApi).to.have.property('hlrLookup').that.is.a('function');
      expect(providers.hlrLookups).to.have.property('hlrLookup').that.is.a('function');
    });

  });

  describe('hlrLookup', function () {

    var validProvider = {
      name: 'validProvider',
      isValid: function () {
        return true;
      },
      hlrLookup: function (number) {
        return {
          id: 'someID',
          mcc: 'someMcc',
          mnc: 'someMnc',
          phone: number || '12345'
        };
      }
    };

    var invalidProvider = {
      name: 'validProvider',
      isValid: function () {
        return true;
      }
    };


    it('should have hlrLookup function exposed', function () {
      expect(phoneUtils).to.have.property('hlrLookup').that.is.a('function');
    });

    it('should take provider as optional argument', function (done) {

      phoneUtils
      .hlrLookup(testPhoneNumber.number , validProvider)
      .then(function (result) {
        expect(result).eql(validProvider.hlrLookup(testPhoneNumber.number));
        done();
      })
      .catch(done);
    });

    it('should take provider as an options entry', function (done) {
      phoneUtilsBase
      .createInstance( { provider: validProvider} )
      .hlrLookup(testPhoneNumber.number, validProvider)
      .then(function (result) {
        expect(result).eql(validProvider.hlrLookup(testPhoneNumber.number));
        done();
      })
      .catch(done);

    });

    it('should take give precedence to provider past in as an argument over the provider passed as an options entry', function (done) {

      var secondValidProvider = _.clone(validProvider);

      secondValidProvider.hlrLookup = function (number){
        return {
          number: number
        };
      };

      phoneUtilsBase
      .createInstance( { provider: validProvider } )
      .hlrLookup(testPhoneNumber.number, secondValidProvider)
      .then(function (result) {
        expect(result).eql(secondValidProvider.hlrLookup(testPhoneNumber.number));
        done();
      })
      .catch(done);

    });

    it('should not do hlrLookup without provider', function (done) {

      phoneUtils
      .hlrLookup(testPhoneNumber)
      .then(function () {
        return done(new Error('It should not proceed'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include('Invalid HLR lookup provider supplied. Make sure it is an object with name property and a hlrLookup function.');
        done();
      });

    });

    it('should not accept invalid argument provider', function (done) {

      phoneUtils
      .hlrLookup(testPhoneNumber.number, invalidProvider)
      .then(function () {
        return done(new Error('It should not proceed!'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include('Invalid HLR lookup provider supplied. Make sure it is an object with name property and a hlrLookup function.');
        done();
      });

    });

    it('should not accept invalid options provider', function (done) {

      phoneUtilsBase
      .createInstance({provider: invalidProvider})
      .hlrLookup(testPhoneNumber.number)
      .then(function () {
        return done(new Error('It should not proceed!'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include('Invalid HLR lookup provider supplied. Make sure it is an object with name property and a hlrLookup function.');
        done();
      });

    });

    it('should not perform lookups without parameters', function (done) {

      phoneUtils
      .hlrLookup()
      .then(function () {
        chai.fail('IT should not proceed');
        done(new Error('should fail'));
      })
      .catch(function (err) {
        expect(err).to.be.instanceOf(Error);
        expect(err.message).to.include('Invalid HLR lookup provider supplied. Make sure it is an object with name property and a hlrLookup function.');
        done();
      });

    });

  });

});