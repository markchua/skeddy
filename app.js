var express = require('express');
var https = require('https');
var app = express();
var port = process.env.PORT || 7464;
var hostBaseUrl = process.env.HOST || 'http://localhost:' + port;
var apiBaseUrl = process.env.SINGLY_API_HOST || 'https://api.singly.com';
var SINGLY_CLIENT_ID = 'ff47da689272e350f27f65f0cf06313d';
var singly = require('singly')(SINGLY_CLIENT_ID, 'cd161e1dc29cc8796d67ba56f901744f',
    hostBaseUrl + '/callback');

app.use(express.cookieParser());
app.use(express.cookieSession({secret: "skeddydoobydoo"}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

function makeLoginPrefix(account) {
    var encodedCallbackUrl = encodeURIComponent(hostBaseUrl + '/callback');
    return "https://api.singly.com/oauth/authenticate?client_id=" + SINGLY_CLIENT_ID + "&redirect_uri=" + encodedCallbackUrl + "&account=" + account + "&service="
}

app.get('/', function(req, res) {
  if (!!req.session && !!req.session.singlyId) {
    var loginPrefix = makeLoginPrefix(req.session.singlyId);
    res.render("home", {singly_id: req.session.singlyId, base_url: hostBaseUrl});
  } else {
    var loginPrefix = makeLoginPrefix("false");
    res.render("index", {base_url: hostBaseUrl, login_prefix: loginPrefix});
  }
});

app.get('/logout', function(req, res) {
  req.session = null;
  res.redirect('/');
});

app.get('/callback', function(req, res) {
  singly.getAccessToken(req.param('code'), function(err, resp, auth) {
    var accessToken = auth.access_token;
    singly.get('/profiles', { access_token: accessToken }, function(err, profiles) {
      var singlyId = profiles.body.id;
      req.session.singlyId = singlyId;
      res.send('<script type="text/javascript">window.opener.loggedIn("' + singlyId + '","' + accessToken + '");window.close();</script>');
      res.end();
    });
  });
});


app.listen(port);
console.log('Listening on port ' + port);
