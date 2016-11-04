const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../fixture/spredcast.json');
const common = require('spred-common');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const apiSrv = supertest(url);

var cast1;
var cast2;

describe('Testing spredcast routes (/v1/spredcast)', function () {
  before(function (done) {
    this.timeout(4000);
    common.clientModel.createFix(fixture.client.name, fixture.client.key, fixture.client.secret, function (err, cClient) {
      if (err) {
        done(err);
      } else {
        common.userModel.createPassword(fixture.user1.email, fixture.user1.password, fixture.user1.pseudo, fixture.user1.first_name, fixture.user1.last_name, function (err, cUser1) {
          if (err) {
            done(err);
          } else {
            common.userModel.createPassword(fixture.user2.email, fixture.user2.password, fixture.user2.pseudo, fixture.user2.first_name, fixture.user2.last_name, function (err, cUser2) {
              if (err) {
                done(err);
              } else {
                common.userModel.createPassword(fixture.user3.email, fixture.user3.password, fixture.user3.pseudo, fixture.user3.first_name, fixture.user3.last_name, function (err, cUser3) {
                  if (err) {
                    done(err);
                  } else {
                    common.spredCastModel.createNew(cUser1._id, fixture.cast1.name, fixture.cast1.description, fixture.cast1.tags,
                      fixture.cast1.date, fixture.cast1.is_public, fixture.cast1.user_capacity, [], null, function (err, cCast) {
                        if (err) {
                          done(err);
                        } else {
                          common.spredCastModel.createNew(cUser1._id, fixture.cast2.name, fixture.cast2.description, null,
                            fixture.cast2.date, fixture.cast2.is_public, fixture.cast2.user_capacity, [ cUser2 ], null, function (err, cCast2) {
                              if (err) {
                                done(err);
                              } else {
                                common.spredCastModel.updateState(cCast._id, 1, function (err) {
                                  if (err) {
                                    done(err);
                                  } else {
                                    cast1 = cCast;
                                    cast2 = cCast2;
                                    done();
                                  }
                                });
                              }
                            });
                        }
                      });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  describe('Testing cast token creation (POST /v1/spredcast/{id}/token) ', function () {
    it('Should create a cast token for a public cast', function (done) {
      apiSrv
        .post('/v1/spredcast/' + cast1._id + '/token')
        .send({ presenter: false })
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(201)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.cast_token).to.not.be.undefined;
            expect(res.body.spredcast).to.equal(cast1._id.toString());
            expect(res.body.presenter).to.be.false;
            expect(res.body.pseudo).to.not.be.undefined;
            done();
          }
        });
    });

    it('Should refuse to create a presenter token', function (done) {
      apiSrv
        .post('/v1/spredcast/' + cast1._id + '/token')
        .send({ presenter: true })
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(403)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should refuse to create a token for a private cast', function (done) {
      apiSrv
        .post('/v1/spredcast/' + cast2._id + '/token')
        .send({ presenter: true })
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(403)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should reply an error if body is empty', function (done) {
      apiSrv
        .post('/v1/spredcast/' + cast1._id + '/token')
        .send()
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(400)
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
