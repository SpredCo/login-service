const request = require('request');

function getUserInformation (token, cb) {
  var url = 'https://www.googleapis.com/oauth2/v2/userinfo';

  request.get(url, {
    'auth': {
      'bearer': token
    }
  }, function (err, res, body) {
    if (err || res.statusCode !== 200) {
      cb(true);
    } else {
      cb(null, JSON.parse(body));
    }
  });
}

module.exports.getUserInformation = getUserInformation;
