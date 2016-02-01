var chai = require('chai');
var phoneUtils = require('../../index');
var expect = chai.expect;

describe('Phone Number Utils', function initialTests() {

  var validatePNUtils = function validatePNUtils(pnUtils){
    expect(pnUtils).to.have.property('isValid').that.is.a('function');
    expect(pnUtils).to.have.property('isMobile').that.is.a('function');
    expect(pnUtils).to.have.property('toE164').that.is.a('function');
    expect(pnUtils).to.have.property('getType').that.is.a('function');
    expect(pnUtils).to.have.property('getCountryCode').that.is.a('function');
    expect(pnUtils).to.have.property('toNationalNumber').that.is.a('function');
    expect(pnUtils).to.have.property('hlrLookup').that.is.a('function');
    expect(pnUtils).to.have.property('initConfig').that.is.a('function');

    expect(pnUtils.isMobile()).to.be.an.instanceof(Promise);
    expect(pnUtils.isValid()).to.be.an.instanceof(Promise);
    expect(pnUtils.toE164()).to.be.an.instanceof(Promise);
    expect(pnUtils.toNationalNumber()).to.be.an.instanceof(Promise);
    expect(pnUtils.getType()).to.be.an.instanceof(Promise);
    expect(pnUtils.getCountryCode()).to.be.an.instanceof(Promise);
    expect(pnUtils.hlrLookup()).to.be.an.instanceof(Promise);

  };

  it ('should have functions that are promises exposed', function checkFunctionsExposed(done){
    validatePNUtils(phoneUtils);
    done();

  });

  it ('should have functions exposed and accept options param', function checkFunctionsExposed(done){
    var pnUtils = require('./../../lib').initConfig({});
    validatePNUtils(pnUtils);
    done();

  });

});