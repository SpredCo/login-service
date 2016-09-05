const config = require('config');
const httpHelper = require('spred-http-helper');
const userModel = require('spred-common').userModel;

const google = require('googleapis');
const facebook = require('../service/facebookApi');

function registerRoute (router) {
  router.post('/users', createUser);
  router.post('/users/facebook', createFbUser);
  router.post('/users/google', createGoogleUser);
  router.post('/users/pseudo/check', checkPseudo);
}

function createUser (req, res, next) {
  if (req.body.email === undefined || req.body.password === undefined || req.body.pseudo === undefined ||
    req.body.first_name === undefined || req.body.last_name === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    userModel.getByEmail(req.body.email, function (err, fUser) {
      if (err) {
        next(err);
      } else if (fUser != null) {
        httpHelper.sendReply(res, httpHelper.error.userExist());
      } else {
        userModel.getByPseudo(req.body.pseudo, function (err, fUser) {
          if (err) {
            next(err);
          } else if (fUser != null) {
            httpHelper.sendReply(res, httpHelper.error.pseudoExist());
          } else {
            userModel.createPassword(req.body.email,
              req.body.password,
              req.body.pseudo,
              req.body.first_name,
              req.body.last_name,
              function (err, cUser) {
                if (err) {
                  next(err);
                } else {
                  httpHelper.sendReply(res, 201, cUser);
                }
              });
          }
        });
      }
    });
  }
}

function createFbUser (req, res, next) {
  if (req.body.access_token === undefined || req.body.pseudo === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    facebook.getUserInformation(req.body.access_token, 'me', function (err, fbErr, userInfo) {
      if (err) {
        next(err);
      } else if (fbErr) {
        httpHelper.sendReply(res, fbErr);
      } else {
        userModel.getByEmail(userInfo.email, function (err, fUser) {
          if (err) {
            next(err);
          } else if (fUser != null) {
            httpHelper.sendReply(res, httpHelper.error.userExist());
          } else {
            userModel.getByPseudo(req.body.pseudo, function (err, fUser) {
              if (err) {
                next(err);
              } else if (fUser != null) {
                httpHelper.sendReply(res, httpHelper.error.pseudoExist());
              } else {
                userModel.createFacebook(
                  userInfo.email,
                  userInfo.id,
                  req.body.pseudo,
                  userInfo.first_name,
                  userInfo.last_name,
                  userInfo.picture.data.url,
                  function (err, cUser) {
                    if (err) {
                      next(err);
                    } else {
                      httpHelper.sendReply(res, 201, cUser);
                    }
                  }
                );
              }
            });
          }
        });
      }
    });
  }
}

function createGoogleUser (req, res, next) {
  if (req.body.access_token === undefined || req.body.pseudo === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    const oauth2Service = google.oauth2({version: 'v2'});

    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2();
    oauth2Client.setCredentials({
      access_token: req.body.access_token
    });

    oauth2Service.userinfo.v2.me.get({auth: oauth2Client, key: config.get('googleApiKey')}, function (err, userInfo) {
      if (err) {
        httpHelper.sendReply(res, httpHelper.error.invalidGoogleToken());
      } else {
        userModel.getByEmail(userInfo['email'], function (err, fUser) {
          if (err) {
            next(err);
          } else if (fUser != null) {
            httpHelper.sendReply(res, httpHelper.error.userExist());
          } else {
            userModel.getByPseudo(req.body.pseudo, function (err, fUser) {
              if (err) {
                next(err);
              } else if (fUser != null) {
                httpHelper.sendReply(res, httpHelper.error.pseudoExist());
              } else {
                userModel.createGoogle(
                  userInfo['email'],
                  userInfo['id'],
                  req.body.pseudo,
                  userInfo['given_name'],
                  userInfo['family_name'],
                  userInfo['picture'] + '?sz=50',
                  function (err, cUser) {
                    if (err) {
                      next(err);
                    } else {
                      httpHelper.sendReply(res, 201, cUser);
                    }
                  });
              }
            });
          }
        });
      }
    });
  }
}

function checkPseudo (req, res, next) {
  if (req.body.pseudo === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    userModel.getByPseudo(req.body.pseudo, function (err, fUser) {
      if (err) {
        next(err);
      } else if (fUser == null) {
        httpHelper.sendReply(res, 200, {});
      } else {
        httpHelper.sendReply(res, httpHelper.error.pseudoExist());
      }
    });
  }
}

module.exports.registerRoute = registerRoute;
