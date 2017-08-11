var express = require('express');
var request = require('request');

var app = express();

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

var myIp;
request('http://169.254.169.254/latest/meta-data/public-hostname', function(error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log('http://' + body)
    myIp = 'http://' + body;
    request(myIp + ':8084', function(error, response, body) {
      if(!error && response.statusCode == 200) {
        console.log('it worked!')
      }
      else {
        console.log('error')
      }
    })
  }
})

app.get('/ris', function(req, res) {
  res.redirect(myIp + ':8082?lat=' + req.query.lat + '&lng=' + req.query.lng + '&radius=' + req.query.radius);
})

app.get('/risdescr', function(req, res) {
  res.redirect(myIp + ':8082/descr?placeid=' + req.query.placeid);
})

app.get('/placedet', function(req, res) {
  res.redirect(myIp + ':8081/?placeid=' + req.query.placeid);
})

app.get('/placedetrev', function(req, res) {
  res.redirect(myIp + ':8081/reverse?lat=' + req.query.lat + "&lng=" + req.query.lng);
})

app.get('/qc', function(req, res) {
  res.redirect(myIp + ':8084/');
})

app.get('/qcpage', function(req, res) {
  res.redirect(myIp + ':8084/page?link=' + req.query.link);
})

app.get('/taattr', function(req, res) {
  if (req.query.placeid == undefined)
    res.redirect(myIp + ':8080?loc=' + req.query.loc);
  else
    res.redirect(myIp + ':8080?placeid=' + req.query.placeid + '&page=' + req.query.page);
})

app.get('/tarev', function(req, res) {
  if (req.query.risid == undefined)
    res.redirect(myIp + ':8083?ris=' + req.query.ris + '&citta=' + req.query.citta);
  else
    res.redirect(myIp + ':8083?placeid=' + req.query.placeid + '&risid=' + req.query.risid + '&page=' + req.query.page);
})

app.listen(8090, function() {
  console.log('Mediator listening on port 8090!');
})
