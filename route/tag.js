const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/tags', getAllTags);
  router.get('/tags/:name', getTagByName);
}

function getAllTags (req, res, next) {
  common.tagModel.getAll(function (err, fTags) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fTags);
    }
  });
}

function getTagByName (req, res, next) {
  common.tagModel.getByName(req.params.name, function (err, fTag) {
    if (err) {
      next(err);
    } else if (fTag === null) {
      httpHelper.sendReply(res, httpHelper.error.tagNotFound());
    } else {
      httpHelper.sendReply(res, 200, fTag);
    }
  });
}

module.exports.registerRoute = registerRoute;
