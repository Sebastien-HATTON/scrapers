var express = require('express');
var request = require('request');
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var CachemanMongo = require('cacheman-mongo');
var qcCache = new CachemanMongo('mongodb://127.0.0.1:27017/cache', {
  collection: 'qc'
});
var qcPagesCache = new CachemanMongo('mongodb://127.0.0.1:27017/cache', {
  collection: 'qcPages'
});
var taCache = new CachemanMongo('mongodb://127.0.0.1:27017/cache', {
  collection: 'ta'
});
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
    qcCache.get('data', (error, value) => {
      if (error) {
        request(myIp + ':8084', function(error, response, body) {
          if (!error && response.statusCode == 200) {
            // myCache.set("data", body);
            qcCache.set('data', body, (error) => console.log(console.error()))
          } else
            console.log(error)
        })
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
  // res.redirect(myIp + ':8084/');
  res.send(JSON.parse(myCache.get("data", true))[req.query.regione]);
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

app.get('/sagre', function(req, res) {
  res.redirect(myIp + ':3000/sagre?regione=' + req.query.regione + '&provincia=' +
    req.query.provincia + '&mese=' + req.query.mese + '&num=' + req.query.num);
})

app.get('/sagredescr', function(req, res) {
  res.redirect(myIp + ':4000/desc?url=' + req.query.url);
})

app.get('/wiki', function(req, res) {
  res.redirect(myIp + ':5000/wiki?attr=' + req.query.attr + '&loc=' + req.query.loc);
})

app.listen(8090, function() {
  console.log('Mediator listening on port 8090!');
})
