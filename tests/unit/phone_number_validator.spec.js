var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var PNValidator = require('../../lib/validators/phone_number_validator');

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Phone Number Validator', function () {

  it('should have isValid function exposed', function checkFunctionsExposed(done) {

    expect(PNValidator).to.be.ok;
    expect(PNValidator).to.have.property('isValid').that.is.a('function');
    expect(PNValidator.isValid()).to.be.instanceof(Promise);
    done();

  });

  it('should not allow null input', function checkNotAllowNull(done) {
    expect(PNValidator.isValid(null)).to.eventually.equal(false).and.notify(done);
  });

  it('should not allow empty string input', function checkNotAllowEmptyString(done) {
    expect(PNValidator.isValid('')).to.eventually.equal(false).and.notify(done);
  });

  it('should not allow undefined input', function checkNotAllowUndefined(done) {
    expect(PNValidator.isValid()).to.eventually.equal(false).and.notify(done);
  });

  it('should not allow number input', function checkNotAllowNumber(done) {
    expect(PNValidator.isValid(123)).to.eventually.equal(false).and.notify(done);
  });

  it('should not allow object input', function checkNotAllowObject(done) {
    expect(PNValidator.isValid({})).to.eventually.equal(false).and.notify(done);
  });

  it('should allow string input', function checkAllowString(done) {
    expect(PNValidator.isValid('123')).to.eventually.equal(true).and.notify(done);
  });

  it('should allow array input if it consists of non falsy strings', function checkAllowArray(done) {
    expect(PNValidator.isValid(['123', '223'])).to.eventually.equal(true).and.notify(done);
  });

  it('should not allow array input if it is mixed', function checkAllowMixedArray(done) {
    expect(PNValidator.isValid(['123', '223', null, {}])).to.eventually.equal(false).and.notify(done);
  });


});