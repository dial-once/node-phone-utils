/**
 * A simple helper for hodling common testing function!
 * @module common
 */
var expect = require('chai').expect;

module.exports = {

  /**
   * Util method to validate a logger
   * @param logger
   */
  validateLogger: function validateLogger(logger) {
    expect(logger).to.be.an('object').that.is.ok;
    expect(logger).to.have.property('log').that.is.a('function');
    expect(logger).to.have.property('info').that.is.a('function');
    expect(logger).to.have.property('debug').that.is.a('function');
    expect(logger).to.have.property('error').that.is.a('function');
    expect(logger).to.have.property('warn').that.is.a('function');
    expect(logger).to.have.property('verbose').that.is.a('function');
  }
};