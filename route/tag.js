const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/tags', getAllTags);
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

module.exports.registerRoute = registerRoute;
