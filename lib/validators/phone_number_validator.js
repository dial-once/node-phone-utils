/**
 * A phone number utilities validator module!
 * @module phone-number-validator
 */

var PNValidator = {};
var InputValidator  = require('./input_validator');

PNValidator.isValid = function isValid(phoneNumber, countryCode) {
  return new Promise (function(resolve){

    if (!InputValidator.isValidInput(phoneNumber, true)) {
      return resolve(false);
    } else {
      //TODO Phonenumber utils
     return resolve(true);
    }

  });
};

module.exports = PNValidator;
