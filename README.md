# node-phone-utils

[![Circle CI](https://circleci.com/gh/dial-once/node-phone-utils.svg?style=svg)](https://circleci.com/gh/dial-once/node-phone-utils)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/06485e15d4f64f22adb649fe5f608346)](https://www.codacy.com/app/mihovil-rister/node-phone-utils)

##Description
  A well documented ant test rich node.js library for parsing, validating, formatting phone numbers and doing HLR lookups of phone numbers via specific or custom providers. 

## Install

`npm i node-phone-utils`

or from github

  `npm i dial.once/node-phone-utils`

## Example usage
### Validate a phone number and print it out
```JavaScript
  var phoneNumberUtils = require('phone-number-utils').createInstance();
  var testPhoneNumber = '+336844321';
  var isValid = phoneNumberUtils.isValid(testPhoneNumber);
  
  if (isValid) {
    console.info(phoneNumberUtils.toNationalNumber(testPhoneNumber))
  }
```

##Documentation
To generate fresh documentation (JSDoc) run 

`npm docs` 

and see it in the *docs* folder.

## Testing
To start tests

`npm test` 

##Coverage
To start instabull coverage

`npm cover` 

##JShint
To start jshint liniting

`npm jshint`

## HLR Lookup Providers
Node-phone-utils uses a set of providers to do hlrLookup of phone numbers.

### Included providers
These are few included providers that come with thi lib and work out of the box and they are:

  1. Hlr-lookups.com provider - a provider to get phone number data from hlr-lookups.com.
  2. Smsapi.com provider - a provider to get phone number data from smsapi.com.

#### Example: HlrLookups.
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

#### Example: SmsApi.
```JavaScript
  var phoneNumberUtils = require('phone-number-utils').createInstance();
  var smsApiHlrProvider = phoneNumberUtils.getProviders().smsApi;
  
  phoneNumberUtils
    .hlrLookup(<phoneNumber>, smsApiHlrProvider)
    .then(function(result){
      //handle result
    })
    .catch (function(err){
     //handle error
   });
```

### Provider account information in .env file
Configuration and authentication information should be set up in your .env file. Example of an .env file with descriptions can be seen in .env.tpl file in the root of this repo.
### Build your own provider
To plugin in your provider you only need to supply an object with a `name` property and `hlrLookup` function to node-phone-utils. You can use built in `hlr-lookup-provider` or `smsapi-lookup-provider` as a reference.

#### Example:

```JavaScript
var mySimpleProvider = {
  name: 'myProvider' ,
  hlrLookup: function (number) {
    // do your lookup stuff
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

