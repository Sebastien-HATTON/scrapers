var express = require('express');
var cheerio = require('cheerio');
var request = require('request');
var app = express();

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/sagre', function (req, res) {
  url = 'http://www.sagreneiborghi.it/cerca/regione-'+req.query.regione+'/provincia-di-'+req.query.provincia+'/mese-di-'+req.query.mese+'/page/'+req.query.num+'/';
  console.log(url)
  var json = []
  var url_sagre =[]
  var url_image = []
  var limit;

  request(url,function(error,response, body){//sist 59

  if(!error && response.statusCode == 200){ //sist 52
    $ = cheerio.load(body);
    $('div.col.col1.static').remove();
    $('div.flag').remove();
    recensioni = $('div.row.recensione, div.row.segnalato, div.row.normale').parent()
    var image= []


    $('div.col.col1 > img').each(function(i,elem){//va bene
      console.log("salve")
      image.push($(this).attr('src'));
    })//22

    $('div.paginationinner').find('a.page-numbers').last().remove()
    limit = $('div.paginationinner').find('a.page-numbers').last();

    console.log(limit.text());
    var ciccio = $('body').find('div.rowsub')
    console.log(ciccio.length)
   ciccio.each(function(i,elem){
      var href = $(this).parent().parent().attr("href")
      console.log(href)
      var img = $(this).find('div.col.col1 > img').attr('src');
      var name = $(this).find('div.col.col2 > p').text();
      var date = $(this).find('div.col.col3').text();
      date = date.substring(0,date.length-5)
      var country = $(this).find('div.col.col4').text().replace(/^\s+|\s+$/gm, '');
      var region = $(this).find('div.col.col5').text().replace(/^\s+|\s+$/gm, '');
      json.push({
          img : img,
          name : name,
          href : href,
          date : date,
          country : country
          //"limit" : limit
      })
});

  $('a').each(function(i,elem){

    $(this).removeAttr('href');
      $(this).removeAttr('title');

})
}
res.send(json)
})

})



app.get('/desc', function (req, res) {
   url = req.query.desc_sagre;
var json = []
  request(url,function(error,response, body){

  if(!error && response.statusCode == 200){
    $ = cheerio.load(body);


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

 }
 res.send(desc_sagre)
})

})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})
