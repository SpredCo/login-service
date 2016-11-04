const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../../fixture/user/check.json');
const common = require('spred-common');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const loginSrv = supertest(url);

describe('Testing user check', function () {
  before(function (done) {
    common.clientModel.createFix(fixture.client.name, fixture.client.key, fixture.client.secret, function (err, cClient) {
      if (err) {
        done(err);
      } else {
        common.userModel.createPassword(fixture.user.email, fixture.user.password, fixture.user.pseudo, fixture.user.first_name, fixture.user.last_name, function (err, cUser) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
      }
    });
  });

  describe('Testing pseudo check (GET /v1/users/check/pseudo/:pseudo)', function () {
    it('Should reply a 200 with a unused pseudo', function (done) {
      loginSrv
        .get('/v1/users/check/pseudo/' + fixture.unusedPseudo)
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should reply a 403 with a used pseudo', function (done) {
      loginSrv
        .get('/v1/users/check/pseudo/' + fixture.user.pseudo)
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
  });

  describe('Testing email check (GET /v1/users/check/email/:email)', function () {
    it('Should reply 200 if email is not user', function (done) {
      loginSrv
        .get('/v1/users/check/email/' + fixture.unusedEmail)
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            done();
          }
        });
    });

    it('Should reply an error if email address is already user', function (done) {
      loginSrv
        .get('/v1/users/check/email/' + fixture.user.email)
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
  });

  describe('Testing google token check (GET /v1/users/check/google-token/:token)', function () {
    it('Should reply an error if token is invalid', function (done) {
      loginSrv
        .get('/v1/users/check/google-token/' + fixture.invalidGoogleToken)
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(1);
            expect(res.body.message).to.equal('Invalid google token');
            done();
          }
        });
    });
  });

  describe('Testing facebook token check (GET /v1/users/check/facebook-token/:token)', function () {
    it('Should reply an error if token is invalid', function (done) {
      loginSrv
        .get('/v1/users/check/facebook-token/' + fixture.invalidFacebookToken)
        .set('Content-Type', 'application/json')
        .auth(fixture.client.key, fixture.client.secret)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.code).to.equal(2);
            expect(res.body.sub_code).to.equal(2);
            expect(res.body.message).to.equal('Invalid facebook token');
            done();
          }
        });
    });
  });
});
