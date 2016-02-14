/*jshint -W030 */
var chai = require('chai');
var InputValidator = require('../../lib/validators/input_validator');
var expect = chai.expect;

describe('Input Validator', function () {

  it('should have isValidInput function exposed', function checkFunctionsExposed() {
    expect(InputValidator).to.be.ok;
    expect(InputValidator).to.have.property('isValidInput').that.is.a('function');
    expect(InputValidator).to.have.property('isShortNumber').that.is.a('function');
  });

  describe('isValidInput', function () {

    it('should not allow null input', function () {
      expect(InputValidator.isValidInput(null)).to.eql(false);
    });

    it('should not allow empty string input', function () {
      expect(InputValidator.isValidInput('')).to.eql(false);
    });

    it('should not allow undefined input', function () {
      expect(InputValidator.isValidInput()).to.eql(false);
    });

    it('should not allow number input', function () {
      expect(InputValidator.isValidInput(123)).to.eql(false);
    });

    it('should not allow object input', function () {
      expect(InputValidator.isValidInput({})).to.eql(false);
    });

    it('should allow string input', function () {
      expect(InputValidator.isValidInput('pile')).to.eql(true);
    });

    it('should allow array input if defined by allowArray flag', function () {
      expect(InputValidator.isValidInput('pile', true)).to.eql(true);
      expect(InputValidator.isValidInput(['pile'], true)).to.eql(true);
      expect(InputValidator.isValidInput(['123', '223'], true)).to.eql(true);
      expect(InputValidator.isValidInput(['123', '223'], false)).to.eql(false);
    });

    it('should not allow array input if not array of strings', function () {
      var testArray = [
        '1234',
        1234,
        [],
        {},
        null,
        undefined,
        '123'
      ];
      expect(InputValidator.isValidInput(testArray, true)).to.eql(false);
    });

  });

  describe('isShortNumber', function () {

    it('should not allow null input', function () {
      expect(InputValidator.isShortNumber(null)).to.eql(false);
    });

    it('should not consider an empty string as short number', function () {
      expect(InputValidator.isShortNumber('')).to.eql(false);
    });

    it('should not allow undefined input', function () {
      expect(InputValidator.isShortNumber()).to.eql(false);
    });

    it('should not allow number input', function () {
      expect(InputValidator.isShortNumber(123)).to.eql(false);
    });

    it('should not allow object input', function () {
      expect(InputValidator.isShortNumber({})).to.eql(false);
    });

    it('should allow string input', function () {
      var TEST_STR_WITH_LEN_BETWEEN_2_AND_5 = '1234';
      expect(InputValidator.isShortNumber(TEST_STR_WITH_LEN_BETWEEN_2_AND_5)).to.eql(true);
    });

    it('should not consider a 2 char string as short', function () {
      expect(InputValidator.isShortNumber('12')).to.eql(false);
    });

    it('should not consider a 5 char string as short', function () {
      expect(InputValidator.isShortNumber('12345')).to.eql(false);
    });

    it('should not consider a 3 char string as short', function () {
      expect(InputValidator.isShortNumber('123')).to.eql(true);
    });

    it('should not allow array input', function () {
      expect(InputValidator.isShortNumber(['123', '223'])).to.eql(false);
    });

  });

});