# node-phone-utils

##Description
  TBD

## Install
  TBD

##Documentation
To generate fresh documentation (JSDoc) use `grunt jsdoc` and see it in the *docs* folder.

Note: To generate documentation for private members set the private flag to true in gruntfile.js jsdoc configuration section.

## Testing
To start tests do the 
`grunt test` command

## HLR Lookup Providers
Node-phone-utils use a set of providers to do hlrLookup of phone numbers.
### Included providers
These are few included providers that come with thi lib and work out of the box and they are:

  1. Hlr-lookups.com provider - a provider to get phone number data from hlr-lookups.com.
  2. Smsapi.com provider - a provider to get phone number data from smsapi.com.
  3. Nexmo provider - a provider to get phone number data from nexmo.com.

#### Example: HlrLookups.
```JavaScript
  var phoneNumberUtils = require('phone-number-utils');
  var hlrProvider = phoneNumberUtils.providers.hlrLookups;
  
  phoneNumberUtils
    .hlrLookup(<phoneNumber>, hlrProvider)
    .then(function(result){
      //handle result
    })
    .catch (function(err){
     //handle error
   });

#### Example: SmsApi.
```JavaScript
  var phoneNumberUtils = require('phone-number-utils');
  var smsApiHlrProvider = phoneNumberUtils.providers.smsApi;
  
  phoneNumberUtils
    .hlrLookup(<phoneNumber>, smsApiHlrProvider)
    .then(function(result){
      //handle result
    })
    .catch (function(err){
     //handle error
   });

#### Example: NEXMO.
```JavaScript
  var phoneNumberUtils = require('phone-number-utils');
  var smsApiHlrProvider = phoneNumberUtils.providers.Nexmo;
  
  //TODO

### Provider account information in .env file
TBD
### Build your own provider
TBD
