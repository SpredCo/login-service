const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/spredcasts', getAvailableCast);
  router.get('/spredcasts/tag/:tag', getByTag);
  router.get('/spredcasts/:url', getCast);
  router.post('/spredcasts/:id/token', createCastToken);
}

function getAvailableCast (req, res, next) {
  common.spredCastModel.findAvailableCast(function (err, fCasts) {
    if (err) {
      next(err);
    } else {
      var result = [];
      fCasts.forEach(function (cast) {
        result.push(cast.toObject({ print: true }));
      });
      httpHelper.sendReply(res, 200, result);
    }
  });
}

function getCast (req, res, next) {
  common.spredCastModel.getByUrl(req.params.url, function (err, fCast) {
    if (err) {
      next(err);
    } else if (fCast === null) {
      httpHelper.sendReply(res, httpHelper.error.castNotFound());
    } else {
      httpHelper.sendReply(res, 200, fCast);
    }
  });
}

function getByTag (req, res, next) {
  common.tagModel.getByName(req.params.tag, function (err, fTag) {
    if (err) {
      next(err);
    } else if (fTag === null) {
      httpHelper.sendReply(res, httpHelper.error.tagNotFound());
    } else {
      common.spredCastModel.getByTag(fTag._id, function (err, fCasts) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, fCasts);
        }
      });
    }
  });
}

function createCastToken (req, res, next) {
  common.spredCastModel.userCanJoin(req.params.id, null, function (err, authorization, presenter, fCast) {
    if (err) {
      next(err);
    } else if (!authorization && fCast === null) {
      httpHelper.sendReply(res, httpHelper.error.castNotFound());
    } else if (!authorization) {
      httpHelper.sendReply(res, httpHelper.error.castAuthorizationRefused());
    } else {
      common.castTokenModel.createNew(req.user, null, fCast, presenter, function (err, cToken) {
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

module.exports.registerRoute = registerRoute;
