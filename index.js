const path = require('path');
const express = require('express');
const logger = require('winston');
const basicAuth = require('./auth/basic');
const passport = require('passport');
const bodyParser = require('body-parser');
const httpHelper = require('spred-http-helper');

const userRoute = require('./route/user/');
const oauth2Route = require('./route/oauth2');
const spredcastRoute = require('./route/spredcast');
const tagsRoute = require('./route/tag');

var loginApp = null;
var loginRouter = null;

function getApp (log, algoliaAddIndexFunc) {
  logger.info('Initializing login app ...');
  loginApp = express();
  loginApp.use(bodyParser.json());
  loginApp.use(passport.initialize());

  loginRouter = express.Router();

  basicAuth.init();

  if (log) {
    loginRouter.use(httpHelper.requestLogger('login'));
  }

  loginRouter.use(passport.authenticate('basic', {session: false}));

  // Register all routes
  userRoute.registerRoute(loginRouter, algoliaAddIndexFunc);
  oauth2Route.registerRoute(loginRouter);
  spredcastRoute.registerRoute(loginRouter);
  tagsRoute.registerRoute(loginRouter);

  loginApp.use('/v1', loginRouter);
  loginApp.use('/doc', express.static(path.join(__dirname, '/doc'), {dotfiles: 'allow'}));

  // Error handler
  loginApp.use(function (err, req, res, next) {
    logger.error(err);
    logger.info(err);
    httpHelper.sendReply(res, httpHelper.error.internalServerError(err));
  });

  logger.info('Login app initialized');

  return loginApp;
}

module.exports.getApp = getApp;
