function BaseProvider(name) {
  this.name = name;
};

BaseProvider.prototype.isValid = function isValid() {
  console.log('this', this);
  return typeof this.hlrLookup === 'function' &&  this instanceof BaseProvider;
};

BaseProvider.prototype.hlrLookup = function hlrLookup() {
  //dummy function to be overridden by implementations;
};

module.exports = BaseProvider;
