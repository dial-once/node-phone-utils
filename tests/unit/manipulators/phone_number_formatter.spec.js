/*jshint -W030 */

var chai = require('chai');
var _ = require('lodash');
var PNFormatterBase = require('../../../lib/formatters/phone_number_formatter');
var PNFormatter = PNFormatterBase.getInstance();

var winston = require('winston');
var winstonLogger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({level: 'debug'})
  ]
});

var PHONE_NUMBERS = require('.././../fixtures/phone_numbers.json').phoneNumbers;
var testPhoneNumber = PHONE_NUMBERS[0];

var expect = chai.expect;

describe('Phone Number Formatter', function () {

  it('should not format for bad format type', function () {
    expect(PNFormatter).to.be.ok;
    expect(PNFormatter).to.have.property('toCustomFormat').that.is.a('function');
    var fn = function () {
      return PNFormatter.toCustomFormat('', '');
    };
    expect(fn).to.throw(Error);
  });

  it('should not format for unrecognized format type', function () {
    var fn = function () {
      return PNFormatter.toCustomFormat(testPhoneNumber, 'Machiavellian');
    };
    expect(fn).to.throw(Error);
  });

  it('should not format for unrecognized format type number', function () {
    var fn = function () {
      return PNFormatter.toCustomFormat(testPhoneNumber, 2046);
    };
    expect(fn).to.throw(Error);
  });

  it('should format for recognized format type number', function () {
    var fn = function () {
      return PNFormatter.toCustomFormat(testPhoneNumber, 1);
    };
    expect(fn).to.not.throw(Error);
  });

  describe('toE164', function () {

    it('should have toE164 function exposed', function () {
      expect(PNFormatter).to.be.ok;
      expect(PNFormatter).to.have.property('toE164').that.is.a('function');
    });

    it('should not allow null input', function () {
      var fn = function () {
        return PNFormatter.toE164(null);
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow empty string input', function () {
      var fn = function () {
        return PNFormatter.toE164('');
      };
      expect(fn).to.throw(Error);

    });

    it('should not allow undefined input', function () {
      var fn = function () {
        return PNFormatter.toE164();
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow number input', function () {
      var fn = function () {
        return PNFormatter.toE164(123);
      };
      expect(fn).to.throw(TypeError);
    });

    it('should not allow object input', function () {
      var fn = function () {
        return PNFormatter.toE164({});
      };
      expect(fn).to.throw(TypeError);
    });

    it('should allow string input', function () {
      expect(testPhoneNumber).to.be.a('string');
      expect(PNFormatter.toE164(testPhoneNumber)).to.be.a('string').that.is.ok;
    });

    it('should not allow array input if it is mixed', function () {
      var fn = function () {
        return PNFormatter.toE164(['123', '223', null, {}]);
      };
      expect(fn).to.throw(TypeError);
    });

    describe('Phone number fixtures', function () {

      it('should check if all numbers from fixtures can be formatted to e164', function () {

        //last 2 are short numbers aht need country code so are excluded from this test
        var formattedNumbers = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (phoneNumber) {
          return PNFormatter.toE164(phoneNumber);
        });

        _.each(formattedNumbers, function (fmtPhoneNumber) {
          expect(fmtPhoneNumber).to.be.a('string').that.is.ok;
        });

      });
    });

    describe('With options for logging', function () {

      it('should do logging internally if logger specified by options', function () {
        var pnFormatterWithLogger = PNFormatterBase.getInstance({logger: winstonLogger});
        expect(pnFormatterWithLogger.toE164(testPhoneNumber)).to.be.a('string').that.is.ok;
      });

    });

  });

  describe('toNationalNumber', function () {

    it('should have toNationalNumber function exposed', function () {
      expect(PNFormatter).to.be.ok;
      expect(PNFormatter).to.have.property('toNationalNumber').that.is.a('function');
    });

    it('should not allow null input', function () {
      var fn = function () {
        return PNFormatter.toNationalNumber(null);
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow empty string input', function () {
      var fn = function () {
        return PNFormatter.toNationalNumber('');
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow undefined input', function () {
      var fn = function () {
        return PNFormatter.toNationalNumber();
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow number input', function () {
      var fn = function () {
        return PNFormatter.toNationalNumber(123);
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow object input', function () {
      var fn = function () {
        return PNFormatter.toNationalNumber({});
      };
      expect(fn).to.throw(Error);
    });

    it('should not allow string input', function () {
      var fn = function () {
        return PNFormatter.toNationalNumber('string');
      };
      expect(fn).to.throw(Error);
    });

    it('should get national number format when phone number is supplied.', function () {
      expect(testPhoneNumber).to.be.a('string');
      var formattedNumber = PNFormatter.toNationalNumber(testPhoneNumber);
      expect(formattedNumber).to.be.a('string').that.is.ok;
    });

    it('should get type for a range of phone numbers from fixtures with logging', function () {

      var pnFormatter = PNFormatterBase.getInstance({logger: winston});
      var nationalNumbers = _.map(_.take(PHONE_NUMBERS, PHONE_NUMBERS.length - 2), function (phoneNumber) {
        return pnFormatter.toNationalNumber(phoneNumber);
      });

      expect(nationalNumbers).to.be.an('array').and.to.be.ok;

      _.each(nationalNumbers, function (nationalNumber) {
        expect(nationalNumber).to.be.a('string').that.is.ok;
      });

    });

  });

});