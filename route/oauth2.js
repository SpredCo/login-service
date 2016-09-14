const oauth2 = require('../auth/oauth');
const passport = require('passport');
const common = require('spred-common');
const httpHelper = require('spred-http-helper');

const google = require('../service/googleAPI');
const facebook = require('../service/facebookApi');

function registerRoute (router) {
  router.post('/oauth2/token', passport.authenticate('basic', { session: false }), oauth2.token);
  router.post('/oauth2/google-connect', googleConnect);
  router.post('/oauth2/facebook-connect', facebookConnect);
}

function googleConnect (req, res, next) {
  if (req.body.access_token === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    google.getUserInformation(req.body.access_token, function (err, userInfo) {
      if (err) {
        httpHelper.sendReply(res, httpHelper.error.invalidGoogleToken());
      } else {
        common.userModel.getByEmail(userInfo['email'], function (err, fUser) {
          if (err) {
            next(err);
          } else if (fUser == null) {
            httpHelper.sendReply(res, httpHelper.error.userNotFound());
          } else if (fUser.googleId !== userInfo['id']) {
            httpHelper.sendReply(req, httpHelper.error.userExist());
          } else {
            sendTokens(res, req.user, fUser, false, next);
          }
        });
      }
    });
  }
}

function facebookConnect (req, res, next) {
  if (req.body.access_token === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    facebook.getUserInformation(req.body.access_token, 'me', function (err, fbErr, userInfo) {
      if (err) {
        next(err);
      } else if (fbErr) {
        httpHelper.sendReply(res, fbErr);
      } else {
        common.userModel.getByEmail(userInfo.email, function (err, fUser) {
          if (err) {
            next(err);
          } else if (fUser == null) {
            httpHelper.sendReply(res, httpHelper.error.userNotFound());
          } else if (fUser.facebookId !== userInfo.id) {
            httpHelper.sendReply(res, httpHelper.error.userExist());
          } else {
            sendTokens(res, req.user, fUser, false, next);
          }
        });
      }
    });
  }
}

function sendTokens (res, client, user, newUser, next) {
  common.accessTokenModel.createNew(client, user, function (err, cAccessToken) {
    if (err) {
      next(err);
    } else {
      common.refreshTokenModel.createNew(client, user, function (err, cRefreshToken) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, {
            accessToken: cAccessToken.token,
            refreshToken: cRefreshToken.token,
            expiresIn: cAccessToken.duration,
            tokenType: 'Bearer',
            newUser: newUser
          });
        }
      });
    }
  });
}

module.exports.registerRoute = registerRoute;
