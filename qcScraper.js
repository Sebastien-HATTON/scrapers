var express = require('express');
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var app = express();
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
    var request = require('request');
    var webdriver = require('selenium-webdriver'),
      By = webdriver.By,
      until = webdriver.until;
    var driver = new webdriver.Builder()
      .forBrowser('chrome')
      .build();
    var toReturn = [];
    var names = [];
    var links = [];
    driver.get('http://www.quattrocalici.it/ricerca/denominazioni')
    driver.wait(until.elementLocated(By.id('edit-field-den-prov2-value')), 1000);
    driver.findElement(By.id('edit-field-den-prov2-value')).sendKeys(req.query.loc);
    driver.findElement(By.id('edit-submit-denominazioni')).click()
    driver.findElement(By.id('edit-submit-denominazioni'))
      .then((elem) => {
        // driver.wait(until.elementIsDisabled(elem))
        // driver.wait(until.elementIsEnabled(elem))
        driver.wait(until.stalenessOf(elem), 5000)
          .then(_ => {
            //driver.findElements(By.xpath("//*[@id='block-system-main']/div/div[3]/table/tbody/tr"))
            driver.findElements(By.xpath("//*[@id='block-system-main']/div/div[3]/table/tbody/tr/td[contains(text(), 'IGP') or contains(text(), 'DOP')]/.."))
              .then((elems) => {
                for (var i in elems) {
                  elems[i].findElement(By.css("td > a"))
                    .then((anchor) => {
                      anchor.getText()
                        .then((name) => names.push(name))
                      anchor.getAttribute("href")
                        .then((link) => links.push(link))
                    })
                }
              })
          })

      })
      // driver.wait(until.elementsLocated(By.className('throbber')), 1000)
      // driver.wait(until.stalenessOf(By.className('throbber')), 1000)
      // driver.wait(until.elementIsDisabled(By.id('edit-submit-denominazioni')), 2000)
      // driver.wait(until.elementIsEnabled(By.id('edit-submit-denominazioni')), 2000)
      // driver.wait(until.stalenessOf(By.css('#views-exposed-form-denominazioni-denominazioni-ricerca > div > div > div > div.views-exposed-widget.views-submit-button > div > div')), 3000)
      .then(_ => {
        for (var i = 0; i < names.length; i++)
          toReturn.push({
            name: names[i],
            link: links[i]
          })
      })
      .then(_ => {
        res.send(toReturn)
        myCache.set(req.query.loc, toReturn);
      })
      // .then(_ => driver.quit())
      .then(_ => {
        var end = new Date().getTime();
        var time = end - start;
        console.log('Execution time: ' + time);
      })
  }
});

app.get('/page', function(req, res) {
  request(req.query.link, function(error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    var cheerio = require('cheerio');
    $ = cheerio.load(body);
    // res.send({body : $("div#block-system-main div.region-inner.clearfix").remove("h2.field-label").html()});
    $("section.field.field-label-inline.clearfix.view-mode-full").remove();
    res.send({body: $("div#block-system-main div.region-inner.clearfix").html()});
    // res.send($("div#block-system-main div.region-inner.clearfix").html());
    // res.send($("body").html());
    // res.send("porco dio");
    // res.send($("h2.field-label").remove().html());
  });
});

app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});
