const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../../fixture/user/index.json');
const common = require('spred-common');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const loginSrv = supertest(url);

var user;

describe.only('Testing user creation (POST /v1/users)', function () {
  before(function (done) {
    common.clientModel.createFix(fixture.client.name, fixture.client.key, fixture.client.secret, function (err, cClient) {
      if (err) {
        done(err);
      } else {
        common.userModel.createPassword(fixture.user2.email, fixture.user2.password, fixture.user2.pseudo, fixture.user2.first_name, fixture.user2.last_name, function (err, cUser) {
          if (err) {
            done(err);
          } else {
            user = cUser;
            done();
          }
        });
      }
    });
  });

  it('Should create a new user', function (done) {
    loginSrv
      .post('/v1/users')
      .send(fixture.user1)
      .set('Content-Type', 'application/json')
      .auth(fixture.client.key, fixture.client.secret)
      .expect(201)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.id).to.not.be.undefined;
          expect(res.body.email).to.equal(fixture.user1.email);
          expect(res.body.first_name).to.equal(fixture.user1.first_name);
          expect(res.body.last_name).to.equal(fixture.user1.last_name);
          expect(res.body.password).to.be.undefined;
          expect(res.body.pictureUrl).to.be.undefined;
          done();
        }
      });
  });

  it('Should reply error when incomplete body', function (done) {
    loginSrv
      .post('/v1/users')
      .send(fixture.user3)
      .set('Content-Type', 'application/json')
      .auth(fixture.client.key, fixture.client.secret)
      .expect(400)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.message).to.equal('Invalid request');
          done();
        }
      });
  });

  it('Should return an error when not authenticated', function (done) {
    loginSrv
      .post('/v1/users')
      .send(fixture.user1)
      .set('Content-Type', 'application/json')
      .expect(401)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.text).to.equal('Unauthorized');
          done();
        }
      });
  });

  it('Should return an error when bad credential', function (done) {
    loginSrv
      .post('/v1/users')
      .send(fixture.user1)
      .set('Content-Type', 'application/json')
      .auth(fixture.client.key + 'i', fixture.client.secret)
      .expect(401)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.text).to.equal('Unauthorized');
          done();
        }
      });
  });

  it('Should return an error when same email', function (done) {
    loginSrv
      .post('/v1/users')
      .send(fixture.user1)
      .set('Content-Type', 'application/json')
      .auth(fixture.client.key, fixture.client.secret)
      .expect(403)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.code).to.equal(2);
          expect(res.body.sub_code).to.equal(1);
          expect(res.body.message).to.equal('User exists (email address already in use)');
          done();
        }
      });
  });

  it('Should return an error when same pseudo', function (done) {
    loginSrv
      .post('/v1/users')
      .send(fixture.user4)
      .set('Content-Type', 'application/json')
      .auth(fixture.client.key, fixture.client.secret)
      .expect(403)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.code).to.equal(2);
          expect(res.body.sub_code).to.equal(2);
          expect(res.body.message).to.equal('User exists (pseudo already in use)');
          done();
        }
      });
  });

  describe('Testing get user information (GET /v1/users/:id)', function () {
    it('Should reply user information', function (done) {
      loginSrv
        .get('/v1/users/' + user._id)
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.id).to.eql(user._id.toString());
            expect(res.body.email).to.equal(user.email);
            expect(res.body.first_name).to.equal(user.firstName);
            expect(res.body.last_name).to.equal(user.lastName);
            expect(res.body.picture_url).to.equal(user.pictureUrl);
            done();
          }
        });
    });

    it('Should reply user information if param is @userpseudo', function (done) {
      loginSrv
        .get('/v1/users/@' + user.pseudo)
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.id).to.eql(user._id.toString());
            expect(res.body.email).to.equal(user.email);
            expect(res.body.first_name).to.equal(user.firstName);
            expect(res.body.last_name).to.equal(user.lastName);
            expect(res.body.picture_url).to.equal(user.pictureUrl);
            done();
          }
        });
    });

    it('Should reply userNotFound when bad id', function (done) {
      loginSrv
        .get('/v1/users/toto')
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(404)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(1);
            expect(res.body.message).to.equal('Unable to find user');
            done();
          }
        });
    });
  });

  describe('Testing get user follower (GET /v1/users/:id/follower)', function () {
    it('Should reply user followers', function (done) {
      loginSrv
        .get('/v1/users/' + user._id + '/follower')
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(0);
            done();
          }
        });
    });
  });

  describe('Testing get user following (GET /v1/users/:id/following)', function () {
    it('Should reply user following', function (done) {
      loginSrv
        .get('/v1/users/' + user._id + '/following')
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.have.lengthOf(0);
            done();
          }
        });
    });
  });
});
