var express = require('express');
var request = require('request');
var app = express();
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.get('/', function(req, res) {
  var url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyD_9bj_Ao6nklX7PWrM_1E-iDH4EPVWV6A&location="
  +req.query.lat+","+req.query.lng+"&radius="+req.query.radius+"&type=restaurant";
  request(url, function(error, response, body) {
    //res.send(body.json().results);
    // res.send(JSON.parse(body).results);
    var places = JSON.parse(body).results;
    var toReturn = [];
    for(var i in places) {
      if(!places[i].types.includes("lodging")) {
        toReturn.push({
          "name": places[i].name,
          "open_now": (places[i].opening_hours != undefined) ? places[i].opening_hours.open_now : null,
          "photo": (places[i].photos != undefined) ? places[i].photos[0].photo_reference : null,
          "placeId": places[i].place_id,
          "rating": places[i].rating
        })
      }
    }
    res.send(toReturn);
  })
});

app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});
