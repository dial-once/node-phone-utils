# This file contains environment information required for parts of phone-node-lib module to work properly for testing.
# Most notably hlrLookup function and providers it uses. Otherwise env vars are required like int his file
#
#The following are section for authentication configurations of hlr providers.
#Even if you are not using a specific provider it is required ot have the entries (key for it) in this file.
#
#hlr-lookups.com configuration and auth options
HLR_LOOKUPS_USERNAME=<hlr-lookups.com username>
HLR_LOOKUPS_PASSWORD=<hlr-lookups.com username>
#
#smsapi.com #hlr-lookups.com configuration and auth options
SMSAPI_USERNAME=<smsapi.com username>
##api expects md5 hashed password
SMSAPI_HASHED_PASSWORD=<smsapi.com MD5 hashed password>