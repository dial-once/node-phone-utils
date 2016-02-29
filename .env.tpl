#This file contains environment information required for parts of phone-node-lib module to work properly. Most notably hlrLookup function and providers it uses.
#
#global config options
# Set option ENABLE_HLR_LOOKUPS to false to make sure no actual requests are made by HRL lookup providers that might cost you money. The calls will then return dummy data.
# if this option is absent (as process.env.ENABLE_HLR_LOOKUPS) it is considered to be false and no actual lookups will not be made.
# Set to true (via .env file or env variable) to perform actual hlr lookups requests (production mode)
ENABLE_HLR_LOOKUPS=false
#
#The following are section for authentication configurations of hlr providers.
#Even if you are not using a specific provider it is required ot have the entries (key for it) in this file.
#
#hlr-lookups.com configuration and auth options
HLR_LOOKUPS_USERNAME=<hrl-lookups.com username>
HLR_LOOKUPS_PASSWORD=<hrl-lookups.com username>
#
#smsapi.com #hlr-lookups.com configuration and auth options
SMSAPI_USERNAME=<smsapi.com username>
##api expects md5 hashed password
SMSAPI_HASHED_PASSWORD=<smsapi.com MD5 hashed password>