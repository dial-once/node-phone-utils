# node-phone-utils

[![Circle CI](https://circleci.com/gh/dial-once/node-phone-utils.svg?style=svg)](https://circleci.com/gh/dial-once/node-phone-utils)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/06485e15d4f64f22adb649fe5f608346)](https://www.codacy.com/app/mihovil-rister/node-phone-utils)
[![Coverage](http://badges.dialonce.io/?resource=node-phone-utils&metrics=coverage)](http://sonar.dialonce.io/overview/coverage?id=node-phone-utils)
[![Sqale](http://badges.dialonce.io/?resource=node-phone-utils&metrics=sqale_rating)](http://sonar.dialonce.io/overview/debt?id=node-phone-utils)
[![NPM](https://nodei.co/npm/node-phone-utils.png?compact=true)](https://nodei.co/npm/node-phone-utils/)

##Description

A well documented and test rich Node.js library for parsing, validating, formatting phone numbers and doing HLR lookups of phone numbers via specific or custom HLR lookup providers.

## Install

`npm i node-phone-utils`

or from github

  `npm i dial.once/node-phone-utils`

##Included functions

Out of the box this library offers the ability to perform action on one or more (array) phone numbers and they are:
 - isValid
 - isMobile
 - toE164
 - toNationalNumber
 - getType
 - getCountryCode
 - hlrLookup


##Examples

### Validate phone number(s)
```JavaScript
  var phoneNumberUtils = require('phone-number-utils').createInstance();
  var testPhoneNumber = '+336844321'; //e164 formatted number
  var isValid = phoneNumberUtils.isValid(testPhoneNumber);

  if (isValid) {
    console.info(phoneNumberUtils.toNationalNumber(testPhoneNumber));
  }

  // validate a bunch of phone numbers

  var results = phoneNumberUtils.isValid(['e164PhoneNum1', 'e164PhoneNum2']);
  var validPhoneNumbers = results.filter(function(result) {
    return result.isValid;
  })
  .map(function(result) {
    return result.number;
  });

  // print all valid phone numbers in national number form
  console.info(phoneNumberUtils.toNationalNumber(validPhoneNumbers));
```

### Check if phone number(s) are mobile
```JavaScript
  var phoneNumberUtils = require('phone-number-utils').createInstance();
  var testPhoneNumber = '+336844321'; //e164 formatted number
  var isMobile = phoneNumberUtils.isMobile(testPhoneNumber);

  if (isMobile) {
    console.info(phoneNumberUtils.toNationalNumber(testPhoneNumber));
  }

  // check a bunch of phone numbers
  var results = phoneNumberUtils.isMobile(['e164PhoneNum1', 'e164PhoneNum2']);
  var mobilePhoneNumbers = results.filter(function(result) {
    return result.isMobile;
  })
  .map(function(result) {
    return result.number;
  });;

  // print all mobile phone numbers in national number form
  console.info(phoneNumberUtils.toNationalNumber(mobilePhoneNumbers));
```
For more examples of other functions offered by thi library take a look at the test file [here](https://github.com/dial-once/node-phone-utils/blob/master/tests/unit/node-phone-utils.spec.js).

##Documentation

To generate fresh documentation (JSDoc) run

`npm docs`

and see it in the *docs* folder.

##Testing
To start tests

`npm test`

##Coverage

To start istanbul coverage

`npm cover`

##JShint

To start jshint linting

`npm jshint`

##HLR Lookup Providers

Node-phone-utils uses a set of providers to do hlrLookup of phone numbers.

###Included providers

These are few included providers that come with this lib and work out of the box. They are:

  1. Hlr-lookups.com provider - a provider to get phone number data from hlr-lookups.com.
  2. Smsapi.com provider - a provider to get phone number data from smsapi.com.

#### Example: HlR-Lookups
```JavaScript
  var phoneNumberUtils = require('phone-number-utils').createInstance();
  var hlrProvider = phoneNumberUtils.getProviders().hlrLookups;

  phoneNumberUtils
    .hlrLookup(<phoneNumber>, hlrProvider)
    .then(function(result){
      //handle result
    })
    .catch (function(err){
     //handle error
   });
```

####Example: SMSApi
```JavaScript
  var phoneNumberUtils = require('phone-number-utils').createInstance();
  var smsApiHlrProvider = phoneNumberUtils.getProviders().smsApi;

  phoneNumberUtils
    .hlrLookup(<phoneNumber>, smsApiHlrProvider)
    .then(function(result){
      //handle result
    })`
    .catch (function(err){
     //handle error
   });
```

###Provider account(s)

Provider account information is `required` to perform HLR lookups and is set in .env file.
Configuration and authentication details should be set up in your .env file. Example of an .env file with descriptions can be seen in [.env.tpl](https://github.com/dial-once/node-phone-utils/blob/master/.env.tpl) file.

###Build your own provider

To plugin in your provider you only need to supply an object with a `name` property and `hlrLookup` function to node-phone-utils. You can use built in [hlr-lookups-provider](https://github.com/dial-once/node-phone-utils/blob/master/lib/providers/hlr-lookups-provider.js) or [sms-api--provider]("https://github.com/dial-once/node-phone-utils/blob/master/lib/providers/sms-api-provider.js") as references for building your own providers.

####Example:

```JavaScript
var mySimpleProvider = {
  name: 'myProvider' ,
  hlrLookup: function (number) {
    // do your lookup stuff, feel free to return a promise
    //e.g. like this:
    return {
      number: number ,
      mcc: 12 ,
      mnc: 332
    }
  }
};

var phoneNumberUtils = require('phone-number-utils').createInstance();

phoneNumberUtils
.hlrLookup('1234567899' , mySimpleProvider)
.then(function (result) {
  //handle result
})
.catch(function (err) {
  //handle error
});
```
## Async (bulk) HLR lookup of phone numbers
To do a lookup of a larger number of phone numbers it is recommended to use the async lookup feature of this library. Currently only hlr-lookups.com provider is supported.

To use this feature, take a look at the reference implementation example in [server.js](https://github.com/dial-once/node-phone-utils/blob/feature/hlr-lookup-middleware/tests/integration/helpers/server.js) file.
Since generally hlr lookups cost, this library stores any previous lookup results (per hlr lookup provider) and reuses them to minimize calls to the lookup provider. Also, phone numbers are validated prior to lookup and removed from async lookup if they are not valid E164 formatted numbers.

####Example:

```JavaScript
// look into tests/integration/helpers/server.js for full imlpementation
var cacheManager = require('cache-manager');
var phoneUtils = require('phone-number-utils').createInstance();

var cacheStore = cacheManager.multiCaching([cacheManager.caching({
  store: 'memory',
  max: 20000,
  ttl: 5778463 //six months
})]);

var options = {
  provider: phoneUtils.getProviders().hlrLookups,
  callbackUrl: '<callbackURL>',
  callbackIdQSParam: 'id',
  cache: cacheStore,
  lookupTimeout: 180,  //seconds
  resultCallback: function (err, results) {
    //a result was processed and available
    console.info('resultCallback', err, results);
    return results;
  },
  doneCallback: function (err, results) {
    // do what you need when the entire lookup is done.
    console.info('doneCallback', err, results);
    return results;
  }
};

var utils = phoneUtils.getAsyncHlrLookup(options);
var client = utils.lookupClient; // ue client to issue async hlr lookups
var callbackMiddleware = utils.lookupMiddleware; // register this middleware to <callbackURL> on your server

// send a big array with the client
var phoneNumbers = ['+33102030', '+33102030', '...']
client
  .hlrLookup(phoneNumbers, options.callbackUrl)
  .then(function (numbers) {
    console.info('Numbers sent to hlr processing', numbers);
  })
  .catch(console.error);
```

##License
Distributed under MIT license.

##Contribution

As always, contributions are most welcome. Fork -> work -> create PR