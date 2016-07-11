var chai = require('chai');
var uuid = require('node-uuid');
var server;
var PORT = 3000;
var SERVER_BASE_URL = 'http://localhost:' + PORT;

chai.use(require('chai-http'));

var request = chai.request(SERVER_BASE_URL);
var expect = chai.expect;
var uniqueId;

var fixtureResponses = require('../../fixtures/hlr-lookup-responses.json');
var numbers = fixtureResponses.numbers;

function getTimeoutPromise(timer) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      return resolve();
    }, timer);
  });
}
describe('Integration: HLR Lookup with callback', function () {

  beforeEach(function (done) {
    uniqueId = uuid.v4();
    delete require.cache[require.resolve('./server')];
    server = require('./server');
    server.startServer(PORT, done);
  });

  afterEach(function (done) {
    server.stopServer(done);
  });

  var simulateCallbackPosts = function simulatePosts(phoneNumbers) {
    var promises = phoneNumbers.map(function (phoneNumber, index) {
      return getTimeoutPromise((index * 500) + 150)
      .then(function () {
        return request
        .post('/hlr/callback?id=' + uniqueId)
        .send(fixtureResponses.responses[index]);
      });
    });

    return getTimeoutPromise(500)
    .then(function () {
      return Promise.all(promises);
    });
  };

  it('should post an array of phone numbers to be looked up', function (done) {

    server.setDoneCallback(function (err, results) {
      try {
        expect(err).to.be.falsy;
        expect(results).to.be.an('array').and.to.have.length(numbers.length);
        results.forEach(function (result) {
          expect(result).to.be.an('object').and.to.be.ok;
          expect(result.number).to.be.oneOf(numbers);
        });
        done();
      } catch (e) {
        done(e);
      }
    });

    request
    .post('/hlr/lookup')
    .send({numbers: numbers, unid: uniqueId})
    .then(function (res) {
      try {
        expect(res).to.have.status(200);
        expect(Object.keys(res.body)).to.deep.equal(['accepted', 'rejected', 'fromCache']);
        expect(res.body.accepted).to.deep.equal(numbers);
        return simulateCallbackPosts(numbers);
      } catch (e) {
        done(e);
      }
    })
    .catch(done);

  });

  it('should not fail if there are some valid numbers', function (done) {
    var testNumbers = ['a', numbers[0]];
    server.setDoneCallback(function (err, results) {
      try {
        expect(err).to.be.falsy;
        expect(results).to.be.an('array').and.to.be.ok;
        var resultNumbers = results.map(function (result) {
          return result.number;
        });
        expect(resultNumbers).to.be.include(testNumbers[1]);
        expect(resultNumbers).to.be.not.include(testNumbers[0]);
        done();
      } catch (e) {
        done(e);
      }
    });

    request
    .post('/hlr/lookup')
    .send({numbers: testNumbers, unid: uniqueId})
    .then(function (res) {
      expect(res).to.have.status(200);
      expect(Object.keys(res.body)).to.deep.equal(['accepted', 'rejected', 'fromCache']);
      expect(res.body.rejected).to.include(testNumbers[0]);
      return simulateCallbackPosts(numbers);
    })
    .catch(done);

  });

});
