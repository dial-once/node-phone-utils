var util = require('util');
var BaseProvider = require('./base_provider');
var SMSAPI = new require('smsapicom');

function SMSAPILookupsProvider() {
  BaseProvider.apply(this, arguments);
  this.smsapi = new SMSAPI().authentication.loginHashed(this.username, this.password);
}

util.inherits(SMSAPILookupsProvider, BaseProvider);

SMSAPILookupsProvider.prototype.hlrLookup = function hlrLookup(number) {
  return this
    .smsapi
    .hlrLookup(number)
    .execute();
};

module.exports = SMSAPILookupsProvider;

