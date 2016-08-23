const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const common = require('spred-common');

function init () {
  passport.use(new BasicStrategy(
    function (key, secret, done) {
      common.clientModel.getByCredential(key, secret, done);
    }
  ));
}

module.exports.init = init;
