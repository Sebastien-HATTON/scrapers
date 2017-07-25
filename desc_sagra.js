var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var app = express();


app.get('/wiki', function (req, res) {
   url = 'http://www.sagreneiborghi.it/fiordilatte-fiordifesta/';
var json = []
  request(url,function(error,response, body){

  if(!error && response.statusCode == 200){
    $ = cheerio.load(body);
  //  #centrale > div.search_results > div > div.container > a:nth-child(2) > div

  $('a').each(function(i,elem){
    var test = $(this).text()
      $(this).replaceWith(test)
})
      $('#invia_salva').remove()
    $('div.indicative').remove()
    $('a.banda_iz_sapevate_che').remove()
    desc_sagre = $('html').find('#content_centrale').html();
    var json = [];

json.push({
    "desc_sagre" : desc_sagre
})
  //  send(json)
 }
 res.send(desc_sagre)
})

})



app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})
