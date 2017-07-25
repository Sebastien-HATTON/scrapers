var express = require('express');
var request = require('request');
var app = express();
var webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function(req, res) {
  var driver = new webdriver.Builder()
    .forBrowser('chrome')
    .build();
  var start = new Date().getTime();
  var toReturn = {};
  toReturn.reviews = []
  if (req.query.risid == undefined) {
    driver.get('https://www.tripadvisor.it/Restaurants');
    driver.wait(until.elementsLocated(By.className('typeahead_input')), 3000);
    driver.findElement(By.className('typeahead_input')).sendKeys(req.query.ris + " " + req.query.citta);
    driver.findElement(By.id('SUBMIT_RESTAURANTS')).click()
    driver.wait(until.elementLocated(By.id('HEADING')), 10000);
    driver.wait(until.elementLocated(By.id('span.taLnk.ulBlueLinks')), 1000)
      .then(driver.findElement(By.css("span.taLnk.ulBlueLinks")).click()
        .then(_ => {
          getUrlData()
          findReviews()
        }, _ => {
          getUrlData()
          findReviews()
        }), _ => {
          getUrlData()
          findReviews()
        })
  } else {
    driver.get('https://www.tripadvisor.it/Restaurant_Review-' + req.query.placeid
    + '-' + req.query.risid + '-Reviews-or' + req.query.page + '0')
    driver.wait(until.elementLocated(By.id('HEADING')), 10000)
      .then(driver.findElement(By.css("span.taLnk.ulBlueLinks")).click()
        .then(_ => {
          findReviews()
        }, _ => {
          findReviews()
        }))
  }

  function getUrlData() {
    driver.getCurrentUrl()
    .then(url => {
      var urlData = url.split("-");
      toReturn.placeId = urlData[1];
      toReturn.risId = urlData[2];
    })
  }

  function findReviews() {
    driver.findElements(By.css("#taplc_location_reviews_list_0 > div.review-container"))
      .then(elems => {
        for (var i in elems)
          scrapeData(elems[i]);
      })
      .then(_ => {
        res.json(toReturn)
        var end = new Date().getTime();
        var time = end - start;
        console.log('Execution time: ' + time);
        driver.quit();
      })
  }

  function scrapeData(div) {
    var pUtente = div.findElement(By.css("div.ui_column.is-2 span.expand_inline.scrname"))
      .then(span => span.getText())
    var pImg = div.findElement(By.css("img.centeredImg"))
      .then(img => img.getAttribute("src"))
    var pRating = div.findElement(By.css("span.ui_bubble_rating"))
      .then(span => span.getAttribute("class"))
    var pData = div.findElement(By.css("span.ratingDate"))
      .then(span => span.getAttribute("title"))
    var pTitle = div.findElement(By.css("span.noQuotes"))
      .then(span => span.getText())
    var pText = pText = div.findElement(By.css("p.partial_entry"))
      .then(p => p.getText())
    Promise.all([pUtente, pImg, pRating, pData, pTitle, pText])
      .then(values => {
        var r8 = values[2].split(" ")[1].split("_")[1].split("0")[0];
        toReturn.reviews.push({
          utente: values[0],
          img: values[1],
          rating: r8,
          data: values[3],
          title: values[4],
          text: values[5],
        })
      })
  }
})

app.listen(8081, function() {
  console.log('Example app listening on port 8081!');
});
