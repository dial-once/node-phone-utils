
module.exports = {
  /**
   * TODO every one must be documented
   */
  isValid : function isValid(phoneNumber, countryCode){},
  isMobile : function isMobile(phoneNumber, countryCode){},
  toE164 : function toE164(phoneNumber, countryCode){},
  toNationalNumber : function toNationalNumber(phoneNumber, countryCode){},
  getType : function getType(phoneNumber, countryCode){},
  getCountryCode : function getCountryCode(phoneNumber){},
  hlrLookup: function hlrLookup(E164Number){}
};
