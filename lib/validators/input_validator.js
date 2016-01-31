var InputValidator = {};
var _ = require('lodash');

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
