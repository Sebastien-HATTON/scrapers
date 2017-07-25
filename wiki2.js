var express = require('express');
var cheerio = require('cheerio');
const NodeCache = require("node-cache");
var request = require('request');
var app = express();
json =[]
const myCache = new NodeCache();

app.get('/wiki', function (req, res) {
   var url = 'https://www.google.it/search?q='+req.query.attr+'+wikipedia'+req.query.loc;
   var attr = req.query.attr
  request(url,function(error,response, body){
    try {
      value = myCache.get("data", true);
      res.json(value[req.query.attr]);
      var end = new Date().getTime();
      var time = end - start;
      console.log('Execution time: ' + time);
    }
    catch(err){
      if(!error && response.statusCode == 200){
        $ = cheerio.load(body);
        var primo = $('h3.r').first()
        href=  primo.html()
        href = href.split('&amp')[0];
        href = href.split('/url?q=')[1]
        href =href.replace('%2527','%27')

        request(href,function(error,response, body){

        if(!error && response.statusCode == 200){
          var $ = cheerio.load(body);
          console.log("img")
          var ciccio =$('body').find('a.image img').first()
          console.log(ciccio.attr("src"))
          $('a').each(function(i,elem){
            if($(this).hasClass('image')){
            $(this).removeAttr('href');
            }
            else{
            var test = $(this).text()
            $(this).replaceWith(test)}
          })
          while($('div.mw-references-wrap').next().html() !== null){
                $('div.mw-references-wrap').next().remove()
          }
            var parent = $('#Collegamenti_esterni').parent()
          $('td.sinottico_piede2.noprint.metadata').remove()
          $('body').find('table.metadata.noprint.plainlinks.avviso.avviso-informazioni').prev().remove()
          $('body').find('table.metadata.noprint.plainlinks.avviso.avviso-informazioni').remove()
          $('body').find('ul.gallery.mw-gallery-traditional').remove()
          $('table.sinottico').remove()
          $('#toc').remove()
          $('body').find('img').remove()
          $('body').find('div.thumbinner').remove()

          $('table.sinottico').find('img').attr('src')

          console.log($('table.sinottico').find('img').attr('src'))

            $('div.mw-references-wrap').remove()
          $('sup').remove();
          $('span.mw-editsection').remove()
          $('#Note').remove()

          console.log($('#Collegamenti_esterni').parent().next().html())
          console.log("salve sono stato qua")
          var wiki = $('html').find('#mw-content-text').html()

          json.push({
            attr : $('html').find('#mw-content-text').html()
          })
          }
          myCache.set("data",json);
          res.send(json)
        })

      }
    }
})

})


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})



//  console.log($('div.mw-references-wrap').next().html())
//    $('div.mw-references-wrap').next().remove()
//  $('div.mw-references-wrap.mw-references-columns').next().next().remove();
//  $('table.CdA').remove()
//  $('table.noprint').remove()
//  $('ul.gallery.mw-gallery-traditional').remove()
//  $('#interProject').next().remove()
//  $('#Voci_correlate').remove()
//    $('#Note').parent().next().remove()
//  $('#Collegamenti_esterni').parent().next().remove()
//  $('#Collegamenti_esterni').remove()
//    $('#Altri_progetti').remove()
//  $('div.mw-references-wrap.mw-references-columns').remove()
