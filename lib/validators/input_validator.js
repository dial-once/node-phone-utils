/**
 * A simple input validator utility module!
 * @module input-validator
 * @private
 */

var InputValidator = function(){};
var _ = require('lodash');
var MIN_SHORT_NUMBER_LEN = 2;
var MAX_SHORT_NUMBER_LEN = 5;
// a short number is a number whose length is > 2 and < 5

/**
 * Checks input to be non falsy and string
 * @private
 * @param input - input value to test
 * @param allowArray {boolean}  - allow the input to be an array of strings
 * @returns {boolean} - true if input is valid (non falsy string or array of strings if @param allowArray is true), false otherwise
 */
InputValidator.isValidInput = function isValidInput(input, allowArray) {

  var inputValid = false;
  if (input) {
    if (_.isString(input) && input.length > 0) {
      inputValid = true;
    } else if (allowArray && _.isArray(input) && input.length > 0) {
      _.each(input, function (inputItem) {
        inputValid = inputItem && _.isString(inputItem);
        if (inputValid === false) {
          return false;
        }
      });
    }
  }

  return inputValid;
};

/**
 * Checks if a phoneNumber' length is above 2 and less then < 5 and this number is then considered short and cannot be validated, checked for type and etc.
 * @public
 * @param phoneNumber {string} - a valid non empty string representing an e164 phone number.
 * @returns {boolean} true if number is considered short and false otherwise
 */
InputValidator.isShortNumber = function isShortNumber(phoneNumber) {
  return _.isString(phoneNumber) && phoneNumber.length > MIN_SHORT_NUMBER_LEN && phoneNumber.length < MAX_SHORT_NUMBER_LEN;
};

module.exports = InputValidator;
