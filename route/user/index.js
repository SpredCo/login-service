const httpHelper = require('spred-http-helper');
const common = require('spred-common');

const google = require('../../service/googleAPI');
const facebook = require('../../service/facebookApi');
const check = require('./check');

var addIndexFunc;

function registerRoute (router, algoliaAddIndexFunc) {
  router.post('/users', createUser);
  router.post('/users/facebook', createFbUser);
  router.post('/users/google', createGoogleUser);

  router.get('/users/:id', getUserInfo);
  router.get('/users/:id/follower', getUserFollower);
  router.get('/users/:id/follow', getUserFollow);

  addIndexFunc = algoliaAddIndexFunc;
  check.registerRoute(router);
}

function createUser (req, res, next) {
  if (req.body.email === undefined || req.body.password === undefined || req.body.pseudo === undefined ||
    req.body.first_name === undefined || req.body.last_name === undefined) {
    httpHelper.sendReply(res, httpHelper.error.invalidRequestError());
  } else {
    common.userModel.getByEmail(req.body.email, function (err, fUser) {
      if (err) {
        next(err);
      } else if (fUser != null) {
        httpHelper.sendReply(res, httpHelper.error.userExist());
      } else {
        common.userModel.getByPseudo(req.body.pseudo, function (err, fUser) {
          if (err) {
            next(err);
          } else if (fUser != null) {
            httpHelper.sendReply(res, httpHelper.error.pseudoExist());
          } else {
            common.userModel.createPassword(req.body.email,
              req.body.password,
              req.body.pseudo,
              req.body.first_name,
              req.body.last_name,
              function (err, cUser) {
                if (err) {
                  next(err);
                } else {
                  httpHelper.sendReply(res, 201, cUser);
                  indexUser(cUser, function (err) {
                    if (err) {
                      next(err);
                    } else {
                      httpHelper.sendMail(req.body.email, 'welcome', {username: req.body.pseudo});
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
        common.userModel.getByEmail(userInfo.email, function (err, fUser) {
          if (err) {
            next(err);
          } else if (fUser != null) {
            httpHelper.sendReply(res, httpHelper.error.userExist());
          } else {
            common.userModel.getByPseudo(req.body.pseudo, function (err, fUser) {
              if (err) {
                next(err);
              } else if (fUser != null) {
                httpHelper.sendReply(res, httpHelper.error.pseudoExist());
              } else {
                common.userModel.createFacebook(
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
                      indexUser(cUser, function (err) {
                        if (err) {
                          next(err);
                        } else {
                          httpHelper.sendMail(req.body.email, 'welcome', {username: req.body.pseudo});
                        }
                      });
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
    google.getUserInformation(req.body.access_token, function (err, info) {
      if (err) {
        httpHelper.sendReply(res, httpHelper.error.invalidGoogleToken());
      } else {
        common.userModel.getByEmail(info['email'], function (err, fUser) {
          if (err) {
            next(err);
          } else if (fUser != null) {
            httpHelper.sendReply(res, httpHelper.error.userExist());
          } else {
            common.userModel.getByPseudo(req.body.pseudo, function (err, fUser) {
              if (err) {
                next(err);
              } else if (fUser != null) {
                httpHelper.sendReply(res, httpHelper.error.pseudoExist());
              } else {
                common.userModel.createGoogle(
                  info['email'],
                  info['id'],
                  req.body.pseudo,
                  info['given_name'],
                  info['family_name'],
                  info['picture'] + '?sz=50',
                  function (err, cUser) {
                    if (err) {
                      next(err);
                    } else {
                      httpHelper.sendReply(res, 201, cUser);
                      indexUser(cUser, function (err) {
                        if (err) {
                          next(err);
                        } else {
                          httpHelper.sendMail(req.body.email, 'welcome', {username: req.body.pseudo});
                        }
                      });
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

function getUserInfo (req, res, next) {
  if (req.params.id[0] === '@') {
    common.userModel.getByPseudo(req.params.id.substring(1), function (err, fUser) {
      if (err) {
        next(err);
      } else if (fUser == null) {
        httpHelper.sendReply(res, httpHelper.error.userNotFound());
      } else {
        httpHelper.sendReply(res, 200, fUser);
      }
    });
  } else {
    common.userModel.getById(req.params.id, function (err, fUser) {
      if (err) {
        next(err);
      } else if (fUser == null) {
        httpHelper.sendReply(res, httpHelper.error.userNotFound());
      } else {
        httpHelper.sendReply(res, 200, fUser, next);
      }
    });
  }
}

function getUserFollower (req, res, next) {
  common.userModel.getById(req.params.id, function (err, fUser) {
    if (err) {
      next(err);
    } else if (fUser === null) {
      httpHelper.sendReply(res, httpHelper.error.userNotFound());
    } else {
      common.followModel.getUserFollowed(req.params.id, function (err, fFollowers) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, fFollowers);
        }
      });
    }
  });
}

function getUserFollow (req, res, next) {
  common.userModel.getById(req.params.id, function (err, fUser) {
    if (err) {
      next(err);
    } else if (fUser === null) {
      httpHelper.sendReply(res, httpHelper.error.userNotFound());
    } else {
      common.followModel.getUserFollow(req.params.id, function (err, fFollow) {
        if (err) {
          next(err);
        } else {
          httpHelper.sendReply(res, 200, fFollow);
        }
      });
    }
  });
}

function indexUser (cUser, cb) {
  var indexedUser = {
    objectID: cUser._id,
    pseudo: '@' + cUser.pseudo,
    name: '@' + cUser.pseudo,
    firstname: cUser.firstName,
    lastname: cUser.lastName,
    type: 'user'
  };
  addIndexFunc(['user', 'global'], [indexedUser], function (err) {
    if (err) {
      cb(err);
    } else {
      cb();
    }
  });
}

module.exports.registerRoute = registerRoute;
