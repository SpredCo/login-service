const request = require('request');
const queryString = require('querystring');
const httpHelper = require('spred-http-helper');

function getUserInformation (token, userId, cb) {
  var url = 'https://graph.facebook.com/v2.7/' + userId + '?' +
    queryString.stringify({
      fields: 'first_name,last_name,email,id,picture.height(100)',
      access_token: token
    });

  request.get(url, function (err, res, body) {
    if (err) {
      cb(err);
    } else if (res.statusCode !== 200) {
      cb(null, httpHelper.error.invalidFacebookToken());
    } else {
      var reply = JSON.parse(body);
      if (reply.id === undefined || reply.first_name === undefined ||
        reply.last_name === undefined || reply.email === undefined || reply.picture === undefined) {
        cb(null, httpHelper.error.invalidFacebookToken());
      } else {
        cb(null, null, reply);
      }
    }
  });
}

module.exports.getUserInformation = getUserInformation;
