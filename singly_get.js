var https = require('https');
var whitelist = ["gcal", "twitter", "facebook", "foursquare", "linkedin", "tumblr"]
/* Generate the login icons */
var req = https.request({
  hostname: 'api.singly.com', path: '/services'
}, function(res) {
  var data = "";
  res.on('data', function (chunk) {
    data += chunk;
  });
  res.on('end', function () {
    var services = {};
    data = JSON.parse(data);
    for (var i in data) {
      var service = data[i];
      if (!!service.icons && !!service.hasTestKeys && whitelist.indexOf(i) != -1) {
        services[i] = {name: service.name, icon: service.icons[2].source};
      }
    }
    for (var i in whitelist) {
      var service = services[whitelist[i]];
      var name = service.name;
      var icon = service.icon;
      console.log('<a target="_new" title="' + name + '" href="<%- login_prefix %>' + whitelist[i] + '"><img src="' + icon + '" width="32" height="32"></a>');
    }
  });
})
req.end();
