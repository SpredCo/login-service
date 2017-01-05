const common = require('spred-common');
const httpHelper = require('spred-http-helper');

function registerRoute (router) {
  router.get('/feed/home', getHomeFeed);
  router.get('/feed/trend', getTrendFeed);
}

function getHomeFeed (req, res, next) {
  common.spredCastModel.find({ $or: [{ date: { $gt: new Date() }, state: 0 }, { state: 1 }], isPublic: true }).populate('creator tags').sort('date').exec(function (err, fCasts) {
    if (err) {
      next(err);
    } else {
      httpHelper.sendReply(res, 200, fCasts);
    }
  });
}

function getTrendFeed (req, res, next) {
  common.tagModel.getBestTag(5, function (err, fTags) {
    if (err) {
      next(err);
    } else {
      var tagFilter = [];
      fTags.forEach(function (fTag) {
        tagFilter.push(fTag._id.toString());
      });
      common.spredCastModel.findAvailableCast({tags: tagFilter}, function (err, fCasts) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, fCasts);
        }
      });
    }
  });
}

module.exports.registerRoute = registerRoute;
