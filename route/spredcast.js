const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.post('/spredcast/:id/token', createCastToken);
}

function createCastToken (req, res, next) {
  if (req.body.presenter === undefined || typeof (req.body.presenter) !== 'boolean') {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.spredCastModel.userCanJoin(req.params.id, null, req.body.presenter, function (err, authorization, fCast) {
      if (err) {
        next(err);
      } else if (!authorization && fCast === null) {
        httpHelper.sendReply(res, httpHelper.error.castNotFound());
      } else if (!authorization) {
        httpHelper.sendReply(res, httpHelper.error.castAuthorizationRefused());
      } else {
        common.castTokenModel.createNew(req.user, null, fCast, req.body.presenter, function (err, cToken) {
          if (err) {
            next(err);
          } else {
            const reply = {
              cast_token: cToken.token,
              spredcast: fCast._id,
              presenter: cToken.presenter,
              pseudo: cToken.pseudo
            };
            httpHelper.sendReply(res, 201, reply);
          }
        });
      }
    });
  }
}

module.exports.registerRoute = registerRoute;
