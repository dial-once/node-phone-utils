var chai = require('chai');
var phoneUtils = require('../../index');
var expect = chai.expect;

describe('Phone Number Utils', function initialTests() {

  it ('should have functions that are promises exposed', function checkFunctionsExposed(done){
    expect(phoneUtils).to.have.property('isValid').that.is.a('function');
    expect(phoneUtils).to.have.property('isMobile').that.is.a('function');
    expect(phoneUtils).to.have.property('toE164').that.is.a('function');
    expect(phoneUtils).to.have.property('getType').that.is.a('function');
    expect(phoneUtils).to.have.property('getCountryCode').that.is.a('function');
    expect(phoneUtils).to.have.property('toNationalNumber').that.is.a('function');
    expect(phoneUtils).to.have.property('hlrLookup').that.is.a('function');

    expect(phoneUtils.isMobile()).to.be.an.instanceof(Promise);
    expect(phoneUtils.isValid()).to.be.an.instanceof(Promise);
    expect(phoneUtils.toE164()).to.be.an.instanceof(Promise);
    expect(phoneUtils.toNationalNumber()).to.be.an.instanceof(Promise);
    expect(phoneUtils.getType()).to.be.an.instanceof(Promise);
    expect(phoneUtils.getCountryCode()).to.be.an.instanceof(Promise);
    expect(phoneUtils.hlrLookup()).to.be.an.instanceof(Promise);

    done();

  });

});