var express = require('express');
var cheerio = require('cheerio');
const NodeCache = require("node-cache");
var request = require('request');
var app = express();
var json =[]
const myCache = new NodeCache();

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/wiki', function (req, res) {



   var url = 'https://www.google.it/search?q='+  replaceAll(req.query.attr,' ','+') +'+'+req.query.loc + "+wikipedia";

   var attr = req.query.attr
      url=replaceAll(url,"’",'%27')

  request(url,function(error,response, body){
    json = []

      if(!error && response.statusCode == 200){
        $ = cheerio.load(body);
        var google = false
        var primo = $('h3.r').first()

        var risul = $('html').find($('h3.r'))
        href=  primo.html()
        href = href.split('&amp')[0];
        href = href.split('/url?q=')[1]
        href =replaceAll(href,'%2527','%27')
        var div = $('div.g').first()

        href = replaceAll(href,'%25C3%25B2','ò')
        href = replaceAll(href,'%25C3%25A0','à')


        if(href.includes("it.wikipedia.org")){
          var attr = href.split("/wiki/")[1]
          var attr2 = req.query.attr
          attr2 =replaceAll(attr2," ","_")

          var name = req.query.loc
          name = name[0].toUpperCase() + name.substring(1)
          if(similarity(attr2,attr) < 0.55 && attr !=name && !  attr.includes(name)){
              json.push({
                  attr : "<span class =\"assente\">descrizione non disponibile</span>"
              })
              res.send(json)
          }

        }
        else{
          json.push({
            attr : "<span class =\"assente\">descrizione non disponibile</span>"
          })
          res.send(json)
        }
        request(href,function(error,response, body){

        if(!error && response.statusCode == 200 && json.length < 1){
          var name = req.query.loc
          name = name[0].toUpperCase() + name.substring(1)
          var $ = cheerio.load(body);
          var localita = $('html').text().toLowerCase().includes(req.query.loc)
          if(href == 'https://it.wikipedia.org/wiki/'+name){
              $('html').text().includes(req.query.loc)
              var parag = ""
              $('sup').remove();
              $('span.mw-editsection').remove()
              //prova a trovare subito corrispondenza
              var attrazione = req.query.attr
              attrazione = attrazione.replace(/%27/g,".27")
              title = $('body').find('#'+attrazione).html()
              if(title == null){
                parag = ""

                var titles = $('body').find('span.mw-headline')
                // confronto per similaritá
                titles.each(function(i,elem){
                  attrazione = replaceAll(req.query.attr,"_"," ")
                  attrazione = replaceAll(attrazione,"%27","'")
                  title = $(this).text().replace(/ *\([^)]*\) */g, " ")
                  title = title.replace(/ *\"[^)]*\" */g, " ")
                 if(similarity(attrazione,title) > 0.8){
                          title = $(this);
                          return false;
                          }
                else if(similarity(attrazione,title) > 0.55){
                    var trovato = true
                    var parole = attrazione.split(" ")
                    for(i =0 ; i< parole.length; i++){
                      if(!title.includes(parole[i])){
                        trovato = false;
                        break;
                      }
                    }
                    if(trovato){
                      title = $(this)
                      return false;}
                    else {
                      title = null
                    }

                }
                    else {
                        title = null
                    }

                })

                    if(title != null){
                    while(title.parent().next().find('span.mw-headline').length < 1){
                        var test = title.parent().next().text()
                        title.parent().next().remove()
                          parag = parag + "<p>"+test+"</p>"
                    }
            }


              }
              if(parag == "")
                  parag = "<span class =\"assente\">descrizione non disponibile</span>"


              json.push({
                attr : parag
              })

          }

        else if (localita){
          var localita = $('html').text().includes(req.query.loc)


          $('a').each(function(i,elem){
            if($(this).hasClass('image')){
            $(this).removeAttr('href');
            }
            else{
            var test = $(this).text()
            $(this).replaceWith(test)}
          })

          while($('span#Voci_correlate').parent().next().html() !== null){

                $('span#Voci_correlate').parent().next().remove()
          }
          $('span#Voci_correlate').remove()
          while($('span#Bibliografia').parent().next().html() !== null){

                $('span#Bibliografia').parent().next().remove()
          }
          $('span#Bibliografia').remove()
          $('table.metadata.noprint.plainlinks.avviso.avviso-struttura').remove()
          $('#coordinates').remove()
          while($('div.mw-references-wrap').next().html() !== null){
                $('div.mw-references-wrap').next().remove()
          }

            var parent = $('#Collegamenti_esterni').parent()
          $('td.sinottico_piede2.noprint.metadata').remove()
          $('body').find('table.metadata.noprint.plainlinks.avviso.avviso-informazioni').prev().remove()
          $('body').find('table.metadata.noprint.plainlinks.avviso.avviso-informazioni').remove()
          $('body').find('ul.gallery.mw-gallery-traditional').remove()
          $('body').find('h2').remove()
          $('table.noprint').remove()

          $('body').find('.plainlinks.avviso.avviso-contenuto').remove()
          $('table.sinottico').remove()
          $('#toc').remove()
          $('body').find('img').remove()
          $('body').find('div.thumbinner').remove()

          $('table.sinottico').find('img').attr('src')

          $('div.mw-references-wrap').remove()
          $('sup').remove();
          $('span.mw-editsection').remove()
          $('#Note').remove()

          var wiki = $('html').find('#mw-content-text').html()

          json.push({
            attr : $('html').find('#mw-content-text').html()
          })

          }
         else{
            json.push({
              attr : "<span class =\"assente\">descrizione non disponibile</span>"
            })
          }

          res.send(json)
          json = [];
        }

        })

      }

})

})


app.listen(5000, function () {
  console.log('Example app listening on port 5000!')
})


//Here's an answer based on Levenshtein distance https://en.wikipedia.org/wiki/Levenshtein_distance

function similarity(s1, s2) {
var longer = s1;
var shorter = s2;
if (s1.length < s2.length) {
  longer = s2;
  shorter = s1;
}
var longerLength = longer.length;
if (longerLength == 0) {
  return 1.0;
}
return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}


function Compare(strA,strB){
    for(var result = 0, i = strA.length; i--;){
        if(typeof strB[i] == 'undefined' || strA[i] == strB[i]);
        else if(strA[i].toLowerCase() == strB[i].toLowerCase())
            result++;
        else
            result += 4;
    }
    return 1 - (result + 4*Math.abs(strA.length - strB.length))/(2*(strA.length+strB.length));
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function removeParentesi(str) {

    return str.replace(/ *\([^)]*\) */g, " ");
}
