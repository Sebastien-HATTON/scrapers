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
    var end = new Date().getTime();
    var time = end - start;
    console.log('Execution time: ' + time);
  })
});

app.get('/descr', function(req, res) {
  var url = "https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyD_9bj_Ao6nklX7PWrM_1E-iDH4EPVWV6A&language=it&placeid=" + req.query.placeid;
  request(url, function(error, response, body) {
    var info = JSON.parse(body).result;
    var toReturn = {
      lat: info.geometry.location.lat,
      lng: info.geometry.location.lng,
      phone: info.international_phone_number,
      open_now: info.opening_hours.open_now,
      opening_hours: info.opening_hours.weekday_text,
      photos: info.photos,
      reviews: info.reviews,
      site: info.website
    };
    res.send(toReturn);
  })
})

app.listen(8082, function() {
  console.log('Example app listening on port 8082!');
});
