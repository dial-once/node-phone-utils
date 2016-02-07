/**
 * A simple input validator utility module!
 * @module input-validator
 */
var InputValidator = {};
var _ = require('lodash');

/**
 * Checks input to be non falsy and string
 * @param input - input value to test
 * @param allowArray {boolean}  - allow the input to be an array of strings
 * @returns {boolean}  - true if input is valid (non falsy string or array of strings if @param allowArray is true), false otherwise
 */
InputValidator.isValidInput = function isValidInput(input, allowArray) {

  var inputValid = false;
  if (input) {
    if (_.isString(input)) {
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

module.exports = InputValidator;
