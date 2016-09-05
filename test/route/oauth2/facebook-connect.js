const config = require('config');
const prompt = require('prompt');
const expect = require('chai').expect;
const supertest = require('supertest');
const common = require('spred-common');
const fixture = require('../../fixture/oauth2/facebook-connect.json');

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const loginSrv = supertest(url);

var facebookToken;

describe('Testing facebook registration/connection', function () {
  before(function (done) {
    this.timeout(0);
    common.clientModel.createFix(fixture.client.name,
      fixture.client.key,
      fixture.client.secret,
      function (err) {
        if (err) {
          done(err);
        } else {
          prompt.start();
          prompt.get('FacebookAccessToken', function (err, result) {
            if (err) {
              done(err);
            } else {
              facebookToken = result.FacebookAccessToken;
              done();
            }
          });
        }
      });
  });

  it('Should reply an error when user does not exist', function (done) {
    loginSrv
      .post('/v1/oauth2/facebook-connect')
      .send({ 'access_token': facebookToken })
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

  it('Should register a new user from facebook', function (done) {
    loginSrv
      .post('/v1/users/facebook')
      .send({ 'access_token': facebookToken, 'pseudo': fixture.fbUser.pseudo })
      .set('Content-Type', 'application/json')
      .auth(fixture.client.key, fixture.client.secret)
      .expect(201)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.id).to.not.be.undefined;
          expect(res.body.email).to.not.be.undefined;
          expect(res.body.first_name).to.not.be.undefined;
          expect(res.body.last_name).to.not.be.undefined;
          expect(res.body.password).to.be.undefined;
          expect(res.body.picture_url).to.not.be.undefined;
          expect(res.body.pseudo).to.equal(fixture.fbUser.pseudo);
          done();
        }
      });
  });

  it('Should return an error if incomplete body for user creation', function (done) {
    loginSrv
      .post('/v1/users/facebook')
      .send({ 'access_token': facebookToken })
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

  it('Should reply an error if user is already registred', function (done) {
    loginSrv
      .post('/v1/users/facebook')
      .send({ 'access_token': facebookToken, 'pseudo': fixture.fbUser.pseudo })
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

  it('Should reply access and refresh tokens', function (done) {
    loginSrv
      .post('/v1/oauth2/facebook-connect')
      .send({ 'access_token': facebookToken })
      .set('Content-Type', 'application/json')
      .auth(fixture.client.key, fixture.client.secret)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          done(err);
        } else {
          expect(res.body.access_token).to.not.be.undefined;
          expect(res.body.refresh_token).to.not.be.undefined;
          expect(res.body.expires_in).to.equal(3600);
          expect(res.body.token_type).to.equal('Bearer');
          done();
        }
      });
  });
});
