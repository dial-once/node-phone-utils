/**
 * A phone number utilities validator module!
 * @module phone-number-validator
 */

var PNValidator = {};
var InputValidator = require('./input_validator');
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

PNValidator.isValid = function isValid(phoneNumber, countryCode) {
  return new Promise(function (resolve) {

    //TODO info log this
    //console.log('isValid', phoneNumber, countryCode);

    if (!InputValidator.isValidInput(phoneNumber, true)) {
      return resolve(false);
    } else {

      var gPhoneNum = phoneUtil.parse(phoneNumber, countryCode);

      if (countryCode && countryCode.length > 0) {
        // this method is faster if we have country code;
        return resolve(phoneUtil.isValidNumberForRegion(gPhoneNum, phoneUtil.getRegionCodeForCountryCode(countryCode)));
      } else {
        return resolve (phoneUtil.isValidNumber(gPhoneNum));
      }
    }

  });
};

module.exports = PNValidator;
