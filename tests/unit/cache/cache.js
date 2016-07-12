var sinon = require('sinon');
var _  = require('lodash');
/**
 * A simple object based cache
 * @constructor
 */
function Cache(){
  this.storage = {};
  this.set = function (key, value){
    var clonedValue = _.cloneDeep(value);
    this.storage[key] = clonedValue;
    return Promise.resolve(clonedValue);
  }.bind(this);

  this.get = function (key){
    return Promise.resolve(this.storage[key]);
  }.bind(this);

  this.del = function (key, callback){
    delete this.storage[key];
    callback();
  }.bind(this);
};

module.exports.createSimpleCache = function createSimpleCache () {
  return new Cache();
};

function getCache() {
  return {
    get: sinon.stub().returns(Promise.resolve()),
    set: sinon.stub().returns(Promise.resolve(true)),
    del: sinon.stub().callsArgWith(1, null, null)
  };
}

module.exports.getCache = getCache;

function getFailCache() {
  return {
    get: sinon.stub().returns(Promise.reject(new Error('Get fail'))),
    set: sinon.stub().returns(Promise.reject(new Error('Set fail'))),
    del: sinon.stub().callsArgWith(1, new Error('Delete fail'))
  };
}

module.exports.getFailCache = getFailCache;
