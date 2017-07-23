var express = require('express');
var app = express();
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;
var driver = new webdriver.Builder()
  .forBrowser('chrome')
  .build();
// var cors = require('cors');
//app.use(cors());
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.get('/', function(req, res) {
  var start = new Date().getTime();
  try {
    value = myCache.get(req.query.loc, true);
    res.json(value);
    var end = new Date().getTime();
    var time = end - start;
    console.log('Execution time: ' + time);
  } catch (err) {
    var toReturn = [];
    var imgs = [];
    driver.get('https://www.tripadvisor.it/Attractions');
    driver.wait(until.elementsLocated(By.className('typeahead_input')), 3000);
    driver.findElement(By.className('typeahead_input')).sendKeys(req.query.loc);
    driver.findElement(By.id('SUBMIT_THINGS_TO_DO')).click();
    driver.wait(until.elementLocated(By.id('HEADING')), 8000)
      .then(_ => driver.findElements(By.css("#ATTR_ENTRY_ > div.attraction_clarity_cell > div > div")))
      .then((elem) => {
        for (var i = 0; i < elem.length; i++) {
          elem[i].findElement(By.css("div.photo_booking img.photo_image")).getAttribute('src')
            .then((src) => imgs.push(src))
            .catch(_ => imgs.push('noimg'))
          elem[i].findElement(By.css("div.listing_info"))
            .then((el) => el.getText())
            .then((txt) => {
              var elems = txt.split("\n");
              toReturn.push({
                nome: elems[0],
                recensioni: elems[1],
                tipologia: elems[3]
              })
            })
        }
      })
      .then(_ => {
        for (var i = 0; i < toReturn.length; i++)
          toReturn[i].img = imgs[i];
      })
      .then(_ => {
        res.json(toReturn)
        myCache.set(req.query.loc, toReturn);
      })
      .then(_ => driver.quit())
      .then(_ => {
        var end = new Date().getTime();
        var time = end - start;
        console.log('Execution time: ' + time);
      })
  }
});


app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});
