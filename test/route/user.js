const config = require('config');
const expect = require('chai').expect;
const supertest = require('supertest');
const fixture = require('../fixture/user.json');
const clientModel = require('spred-common').clientModel;

const url = config.get('test.server.url') + ':' + config.get('test.server.port');
const loginSrv = supertest(url);

describe('Testing user creation (POST /v1/users)', function () {
  before(function (done) {
    clientModel.createFix(fixture.client.name, fixture.client.key, fixture.client.secret, function (err, cClient) {
      if (err) {
        done(err);
      } else {
        done();
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
      .send(fixture.user2)
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
      .send(fixture.user3)
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

describe('Testing pseudo check (GET /v1/users/pseudo/check/:pseudo)', function () {
  it('Should reply a 200 with a unused pseudo', function (done) {
    loginSrv
      .get('/v1/users/pseudo/check/' + fixture.unusedPseudo)
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
      .get('/v1/users/pseudo/check/' + fixture.user1.pseudo)
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

describe('Testing email check (GET /v1/users/email/check/:email)', function () {
  it('Should reply 200 if email is not user', function (done) {
    loginSrv
      .get('/v1/users/email/check/' + fixture.unusedEmail)
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
      .get('/v1/users/email/check/' + fixture.user1.email)
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
