/*jshint -W030 */
var chai = require('chai');
var EnvOptsParser = require('../../../lib/helpers/environment-options-parser');

var expect = chai.expect;

describe('Helpers: Environment Options Parser', function () {

  describe('isProviderLookupEnabled', function () {

    it('should have getLoggerFacade function exposed', function () {
      expect(EnvOptsParser).to.be.ok;
      expect(EnvOptsParser).to.have.property('isProviderLookupEnabled').that.is.a('function');
    });

    it('should return a boolean', function () {
      expect(EnvOptsParser.isProviderLookupEnabled()).to.be.a('boolean');
    });

  });
});