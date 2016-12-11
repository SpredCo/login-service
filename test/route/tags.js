const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../fixture/tags.json');
const common = require('spred-common');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const apiSrv = supertest(url);

describe('Testing tags route', function () {
  before(function (done) {
    common.clientModel.createFix(fixture.client.name, fixture.client.key, fixture.client.secret, function (err, cClient) {
      if (err) {
        done(err);
      } else {
        common.tagModel.createNew(fixture.tag1.name, fixture.tag1.description, function (err, cTag) {
          if (err) {
            done(err);
          } else {
            common.tagModel.createNew(fixture.tag2.name, fixture.tag2.description, function (err, cTag) {
              if (err) {
                done(err);
              } else {
                done();
              }
            });
          }
        });
      }
    });
  });

  describe('Testing get all tags route (GET /v1/tags)', function () {
    it('Should return all existing tags', function (done) {
      apiSrv
        .get('/v1/tags')
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(3);
            done();
          }
        });
    });
  });
});
