const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../fixture/tags.json');
const common = require('spred-common');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const apiSrv = supertest(url);

var tag1;

describe.only('Testing tags route', function () {
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
                tag1 = cTag;
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
            expect(res.body).to.have.lengthOf(2);
            done();
          }
        });
    });
  });

  describe('Testing get tag by name (GET /v1/tags/:name)', function () {
    it('Should return the cast information', function (done) {
      apiSrv
        .get('/v1/tags/' + tag1.name)
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.id).to.equal(tag1._id.toString());
            done();
          }
        });
    });

    it('Should return an error if no tag is found', function (done) {
      apiSrv
        .get('/v1/tags/toto')
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });
  });
});
