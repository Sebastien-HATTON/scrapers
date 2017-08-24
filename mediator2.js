var express = require('express');
var request = require('request');
var rp = require('request-promise-native');
var app = express();
const socketIo = require('socket.io');
const http = require('http');
const server = http.Server(app);
server.listen(8090);
const io = socketIo(server);
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
var taRevCache = new CachemanMongo('mongodb://127.0.0.1:27017/cache', {
  collection: 'taRev'
});

var ttl = 999999999;
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
      if (error || value == null) {
        request(myIp + ':8084', function(error, response, body) {
          if (!error && response.statusCode == 200) {
            qcCache.set('data', body, ttl)
          } else
            console.log(error)
        })
      }
    })
  }
})

io.on('connection', (socket) => {
  socket.on('getData', (data) => {
    rp(myIp + ':8081/?placeid=' + data.placeid)
      .then(data => {
        socket.emit('placeDetails', data);
        var data = JSON.parse(data)
        rp(myIp + ':8082/?lat=' + data.lat + '&lng=' + data.lng + '&radius=2000')
          .then(data => socket.emit('ristoranti', data))
        sendQc(socket, data.regione);
        sendTaAtt(socket, data.citta);
      })
  })
  socket.on('getRevData', (data) => {
    rp(myIp + ':8081/reverse?lat=' + data.lat + "&lng=" + data.lng)
      .then(data => {
        socket.emit('placeDetails', data);
        var data = JSON.parse(data)
        sendQc(socket, data.regione);
        sendTaAtt(socket, data.citta);
      })
    rp(myIp + ':8082/?lat=' + data.lat + '&lng=' + data.lng + '&radius=2000')
      .then(data => socket.emit('ristoranti', data))
  })
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
  // res.send(JSON.parse(myCache.get("data", true))[req.query.regione]);
  qcCache.get('data', (error, value) => {
    if (error)
      throw error;
    else
      res.send(JSON.parse(value)[req.query.regione]);
  })
})

app.get('/qcpage', function(req, res) {
  // res.redirect(myIp + ':8084/page?link=' + req.query.link);
  qcPagesCache.get(req.query.link, (error, value) => {
    if (error || value == null) {
      request(myIp + ':8084/page?link=' + req.query.link, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          qcPagesCache.set(req.query.link, body, ttl);
          res.send(JSON.parse(body));
        } else
          console.log(error)
      })
    } else
      res.send(value);
  })
})

app.get('/taattr', function(req, res) {
  if (req.query.placeid == undefined) {
    //res.redirect(myIp + ':8080?loc=' + req.query.loc);
    taCache.get(req.query.loc, (error, value) => {
      if (error || value == null) {
        request(myIp + ':8080?loc=' + req.query.loc, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var jbody = JSON.parse(body)
            res.send(jbody);
            if (jbody.places[0].img.indexOf("https://static.tacdn.com/img2/x.gif") == -1)
              taCache.set(req.query.loc, body, ttl);
          } else
            console.log(error)
        })
      } else
        res.send(value);
    })
  } else
    res.redirect(myIp + ':8080?placeid=' + req.query.placeid + '&page=' + req.query.page);
})

function sendQc(socket, regione) {
  qcCache.get('data', (error, value) => {
    if (error)
      throw error;
    else
      socket.emit('qc', JSON.parse(value)[regione]);
  })
}

function sendTaAtt(socket, loc) {
  taCache.get(loc, (error, value) => {
    if (error || value == null) {
      request(myIp + ':8080?loc=' + loc, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var jbody = JSON.parse(body)
          socket.emit('taAttr', JSON.stringify(jbody));
          if (jbody.places[0].img != undefined && jbody.places[0].img.indexOf("https://static.tacdn.com/img2/x.gif") == -1)
            taCache.set(loc, body, ttl);
        } else
          console.log(error)
      })
    } else
      socket.emit('taAttr', value);
  })
}

app.get('/tarev', function(req, res) {
  if (req.query.risid == undefined) {
    taRevCache.get(req.query.ris + '-' + req.query.citta, (error, value) => {
      if (error || value == null) {
        request(myIp + ':8083?ris=' + req.query.ris + '&citta=' + req.query.citta, (error, response, body) => {
          if (!error && response.statusCode == 200) {
            var jbody = JSON.parse(body);
            res.send(jbody);
            taRevCache.set(req.query.ris + '-' + req.query.citta, body, 60 * 60)
          } else
            console.log(error);
        })
      } else
        res.send(value);
    })
  } else
    res.redirect(myIp + ':8083?placeid=' + req.query.placeid + '&risid=' + req.query.risid + '&page=' + req.query.page);
})

app.get('/sagre', function(req, res) {
  res.redirect(myIp + ':3000/sagre?regione=' + req.query.regione + '&provincia=' +
    req.query.provincia + '&mese=' + req.query.mese + '&num=' + req.query.num);
})

app.get('/sagredescr', function(req, res) {
  res.redirect(myIp + ':4000/descr?url=' + req.query.url);
})

app.get('/wiki', function(req, res) {
  res.redirect(myIp + ':5000/wiki?attr=' + req.query.attr + '&loc=' + req.query.loc);
})

// app.listen(8090, function() {
//   console.log('Mediator listening on port 8090!');
// })
