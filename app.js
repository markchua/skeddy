var express = require('express');
var app = express();
var port = process.env.PORT || 7464;
var hostBaseUrl = process.env.HOST || 'http://localhost:' + port;
var apiBaseUrl = process.env.SINGLY_API_HOST || 'https://api.singly.com';
var singly = require('singly')('ff47da689272e350f27f65f0cf06313d', 'cd161e1dc29cc8796d67ba56f901744f',
    hostBaseUrl + '/callback');

app.use(express.cookieParser());
app.use(express.cookieSession({secret: "skeddydoobydoo"}));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
  if (!!req.session && !!req.session.singlyId) {
    res.render("home", {singly_id: req.session.singlyId, base_url: hostBaseUrl});
  } else {
    res.render("index", {base_url: hostBaseUrl});
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
      console.log(singlyId);
      console.log(accessToken);
      req.session.singlyId = singlyId;
      res.send('<script type="text/javascript">window.opener.loggedIn("' + singlyId + '","' + accessToken + '");window.close();</script>');
      res.end();
    });
  });
});


app.listen(port);
console.log('Listening on port ' + port);
