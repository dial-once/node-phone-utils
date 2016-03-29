/**
 * A simple module that gets a environment options
 * @module environment-options-parser
 * @private
 */
require('dotenv').config();

/**
 * Checks if process.env.ENABLE_HLR_LOOKUPS is true so that actual hlr lookups can take place.
 * Note that for some providers hlr lookups if enabled can incur additional costs.
 * @returns {boolean}
 */
module.exports.isProviderLookupEnabled = function isProviderLookupEnabled () {
  return process.env.ENABLE_HLR_LOOKUPS === 'true';
};
