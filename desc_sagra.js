var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var app = express();


app.get('/descr', function (req, res) {
   url = req.query.url;


var json = []
  request(url,function(error,response, body){

  if(!error && response.statusCode == 200){
    $ = cheerio.load(body);

  $('a').each(function(i,elem){
    var test = $(this).text()
      $(this).replaceWith(test)
})

        $('html').find('a.banda_iz_sapevate_che').remove()
    var sapevate =$('div.sapevate_che').html()
    sapevate = sapevate.replace("promosso da Italia Zuccheri, 100% zucchero italiano","")
    console.log(sapevate)
    $('body').find('div.sapevate_che').remove()
    $('body').find('h3.date').remove()
      $('#invia_salva').remove()
    $('div.indicative').remove()

    var desc_sagre = $('html').find('#content_centrale').html();
    var json = [];

json.push({
    body : desc_sagre,
    sapevate : sapevate
})

 }
 res.send(json)
})

})



app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
})
