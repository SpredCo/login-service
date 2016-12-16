const httpHelper = require('spred-http-helper');
const userModel = require('spred-common').userModel;

const google = require('../../service/googleAPI');
const facebook = require('../../service/facebookApi');

function registerRoute (router) {
  router.get('/users/check/pseudo/:pseudo', checkPseudo);
  router.get('/users/check/email/:email', checkEmail);
  router.get('/users/check/google-token/:token', checkGoogleToken);
  router.get('/users/check/facebook-token/:token', checkFacebookToken);
}

function checkPseudo (req, res, next) {
  userModel.getByPseudo(req.params.pseudo, function (err, fUser) {
    if (err) {
      next(err);
    } else if (fUser == null) {
      httpHelper.sendReply(res, 200, {});
    } else {
      httpHelper.sendReply(res, httpHelper.error.pseudoExist());
    }
  });
}

function checkEmail (req, res, next) {
  userModel.getByEmail(req.params.email, function (err, fUser) {
    if (err) {
      next(err);
    } else if (fUser == null) {
      httpHelper.sendReply(res, 200, {});
    } else {
      httpHelper.sendReply(res, httpHelper.error.userExist());
    }
  });
}

function checkGoogleToken (req, res, next) {
  google.getUserInformation(req.params.token, function (err, info) {
    if (err) {
      httpHelper.sendReply(res, httpHelper.error.invalidGoogleToken());
    } else {
      userModel.getByEmail(info['email'], function (err, fUser) {
        if (err) {
          next(err);
        } else if (fUser == null) {
          httpHelper.sendReply(res, 200, { result: 'ok' });
        } else {
          httpHelper.sendReply(res, httpHelper.error.userExist());
        }
      });
    }
  });
}

function checkFacebookToken (req, res, next) {
  facebook.getUserInformation(req.params.token, 'me', function (err, fbErr, info) {
    if (err) {
      next(err);
    } else if (fbErr) {
      httpHelper.sendReply(res, fbErr);
    } else {
      userModel.getByEmail(info.email, function (err, fUser) {
        if (err) {
          next(err);
        } else if (fUser == null) {
          httpHelper.sendReply(res, 200, { result: 'ok' });
        } else {
          httpHelper.sendReply(res, httpHelper.error.userExist());
        }
      });
    }
  });
}

module.exports.registerRoute = registerRoute;
