var chai = require('chai');
var InputValidator = require('../../lib/validators/input_validator');
var expect = chai.expect;

describe('Input Validator', function () {

  it('should have isValidInput function exposed', function checkFunctionsExposed(done) {

    expect(InputValidator).to.be.ok;
    expect(InputValidator).to.have.property('isValidInput').that.is.a('function');
    done();

  });

  it('should not allow null input', function checkNotAllowNull(done) {
    expect(InputValidator.isValidInput(null)).to.eql(false);
    done();
  });

  it('should not allow empty string input', function checkNotAllowEmptyString(done) {
    expect(InputValidator.isValidInput('')).to.eql(false);
    done();
  });

  it('should not allow undefined input', function checkNotAllowUndefined(done) {
    expect(InputValidator.isValidInput()).to.eql(false);
    done();
  });

  it('should not allow number input', function checkNotAllowNumber(done) {
    expect(InputValidator.isValidInput(123)).to.eql(false);
    done();
  });

  it('should not allow object input', function checkNotAllowObject(done) {
    expect(InputValidator.isValidInput({})).to.eql(false);
    done();
  });

  it('should allow string input', function checkAllowString(done) {
    expect(InputValidator.isValidInput('pile')).to.eql(true);
    done();
  });

  it('should allow array input if defined by allowArray flag', function checkAllowArray(done) {
    expect(InputValidator.isValidInput('pile', true)).to.eql(true);
    expect(InputValidator.isValidInput(['pile'], true)).to.eql(true);
    expect(InputValidator.isValidInput(['123', '223'], true)).to.eql(true);
    expect(InputValidator.isValidInput(['123', '223'], false)).to.eql(false);
    done();
  });

  it('should not allow array input if not array of strings', function checkNotAllowNonStringArray(done) {
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
    done();
  });

});