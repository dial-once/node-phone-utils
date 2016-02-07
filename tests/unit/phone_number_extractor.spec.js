/*jshint -W030 */

var chai = require('chai');
var _ = require('lodash');
var chaiAsPromised = require('chai-as-promised');
var PNExtractorBase = require('../../lib/extractors/phone_number_extractor');
var PNExtractor = PNExtractorBase.getInstance();

var winston = require('winston');
var winstonLogger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({level: 'silly'})
  ]
});

var PHONE_NUMBERS = require('./../fixtures/phone_numbers.json').phoneNumbers;
var testPhoneNumber = PHONE_NUMBERS[0];
var testMobilePhoneNumber = '+31612969525';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('Phone Number Extractor', function () {

  describe('getGooglePhoneNumber', function () {

    it('should have getGooglePhoneNumber function exposed and return a promise', function (done) {

      expect(PNExtractor).to.be.ok;
      expect(PNExtractor).to.have.property('getGooglePhoneNumber').that.is.a('function');
      expect(PNExtractor.getGooglePhoneNumber()).to.be.an.instanceof(Promise);
      done();

    });

    it('should not allow null input', function (done) {
      expect(PNExtractor.getGooglePhoneNumber(null)).to.eventually.be.rejected.and.be.an.instanceOf(Error).notify(done);
    });

    it('should not allow empty string input', function (done) {
      expect(PNExtractor.getGooglePhoneNumber('')).to.eventually.be.rejected.and.be.an.instanceOf(Error).notify(done);
    });

    it('should not allow undefined input', function (done) {
      return expect(PNExtractor.getGooglePhoneNumber()).to.eventually.be.rejected.and.be.an.instanceOf(Error).notify(done);
    });

    it('should not allow number input', function (done) {
      expect(PNExtractor.getGooglePhoneNumber(123)).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow object input', function (done) {
      expect(PNExtractor.getGooglePhoneNumber({})).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should allow string input', function (done) {
      expect(testPhoneNumber).to.be.a('string');
      expect(PNExtractor.getGooglePhoneNumber(testPhoneNumber)).to.eventually.be.an('object').that.is.ok.notify(done);
    });

    it('should not allow array input if it is mixed', function (done) {
      expect(PNExtractor.getGooglePhoneNumber(['123', '223', null, {}])).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    describe('Phone number fixtures', function () {

      it('should check if all numbers from fixtures can be used to get google phone number', function (done) {

        //last 2 are short numbers aht need country code so are excluded from this test
        var getGPNumber = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (phoneNumber) {
          return PNExtractor.getGooglePhoneNumber(phoneNumber);
        });

        Promise
        .all(getGPNumber)
        .then(function (gPhoneNumbers) {
          _.each(gPhoneNumbers, function (gPoneNumber) {
            expect(gPoneNumber).to.be.an('Object').that.is.ok;
          });
          done();
        })
        .catch(done);
      });

    });

    describe('With options for logging', function () {

      it('should do logging internally if logger specified by options', function (done) {
        var pnExtractorWithLogger = PNExtractorBase.getInstance({logger: winstonLogger});
        expect(pnExtractorWithLogger.getGooglePhoneNumber(testPhoneNumber)).to.eventually.be.an('Object').notify(done);
      });

    });

  });

  describe('getType', function () {

    var pnTypeValues = _.values(PNExtractor.PhoneNumberType);

    it('should have getType function exposed', function (done) {

      expect(PNExtractor).to.be.ok;
      expect(PNExtractor).to.have.property('getType').that.is.a('function');
      expect(PNExtractor.getType()).to.be.an.instanceof(Promise);
      done();

    });

    it('should not allow null input', function (done) {
      expect(PNExtractor.getType(null)).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow empty string input', function (done) {
      expect(PNExtractor.getType('')).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow undefined input', function (done) {
      return expect(PNExtractor.getType()).to.eventually.be.rejected.and.be.an.instanceOf(Error).notify(done);
    });

    it('should not allow number input', function (done) {
      expect(PNExtractor.getType(123)).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow object input', function (done) {
      expect(PNExtractor.getType({})).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should not allow string input', function (done) {
      expect(testPhoneNumber).to.be.a('string');
      expect(PNExtractor.getType(testMobilePhoneNumber)).to.eventually.be.rejected.and.be.an.instanceOf(TypeError).notify(done);
    });

    it('should get type when google phone number is supplied.', function (done) {
      expect(testPhoneNumber).to.be.a('string');

      PNExtractor
      .getGooglePhoneNumber(testPhoneNumber)
      .then(PNExtractor.getType)
      .then(function (type) {
        expect(type).to.be.a('number');
        expect(pnTypeValues).to.include(type);
        done();
      })
      .catch(done);
    });

    it('should get type for a range of phone numbers from fixtures', function (done) {

      var pnExtractor = PNExtractorBase.getInstance({logger: winston});
      var typePromises = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (phoneNumber) {
        return pnExtractor.getGooglePhoneNumber(phoneNumber).then(PNExtractor.getType);
      });

      return Promise
      .all(typePromises)
      .then(function (results) {

        expect(results).to.be.an('array').and.to.be.ok;

        _.each(results, function (result) {
          expect(result).to.be.a('number');
          expect(pnTypeValues).to.contain(result);
        });

        done();
      })
      .catch(done);

    });

  });
});