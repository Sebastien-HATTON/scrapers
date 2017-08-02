var express = require('express');
var request = require('request');
var app = express();
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.get('/', function(req, res) {
  var start = new Date().getTime();
  var url = "https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyDT2VctDWDuoC3xJjXFTslJJa5nGtAUkSQ&language=it&placeid=" + req.query.placeid;
  request(url, function(error, response, body) {
    var data = JSON.parse(body).result;
    console.log(data.address_components.length)
    var toReturn = {
      // provincia: (data.address_components.length == 6) ? data.address_components[2].long_name.split(" ").pop() : data.address_components[1].long_name.split(" ").pop(),
      // regione: (data.address_components.length == 6) ? data.address_components[3].long_name : data.address_components[2].long_name,
      lat: data.geometry.location.lat,
      lng: data.geometry.location.lng
    };
    var re = new RegExp("[A-Z][A-Z]");
    for(var i in data.address_components) {
      if(re.test(data.address_components[i].short_name)) {
        toReturn.citta = data.address_components[--i].long_name;
        toReturn.provincia = data.address_components[++i].long_name.split(" ").pop();
        toReturn.regione = data.address_components[++i].long_name;
        break;
      }
    }
    res.send(toReturn);
    var end = new Date().getTime();
    var time = end - start;
    console.log('Execution time: ' + time);
  })
});
app.get('/reverse', function(req, res) {
  var start = new Date().getTime();
  var url = "https://maps.googleapis.com/maps/api/geocode/json?language=it&key=AIzaSyDT2VctDWDuoC3xJjXFTslJJa5nGtAUkSQ&latlng=" + req.query.lat + "," + req.query.lng;
  request(url, function(error, response, body) {
    var data = JSON.parse(body).results[0];
    var toReturn = {};
    var re = new RegExp("[A-Z][A-Z]");
    for(var i in data.address_components) {
      if(re.test(data.address_components[i].short_name)) {
        toReturn.citta = data.address_components[--i].long_name;
        toReturn.provincia = data.address_components[++i].long_name.split(" -")[0].split(" ").pop();
        toReturn.regione = data.address_components[++i].long_name.replace(/-/g, " ");
        break;
      }
    }
    res.send(toReturn);
    var end = new Date().getTime();
    var time = end - start;
    console.log('Execution time: ' + time);
  })
});

app.listen(8081, function() {
  console.log('Example app listening on port 8081!');
});
