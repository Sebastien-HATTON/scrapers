var express = require('express');
let request = require('request');
var http = require('http');
var app = express();

app.get('/', function(req, res) {
  var start = new Date().getTime();
  var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
  var driver = new webdriver.Builder()
    .forBrowser('phantomjs')
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
          driver.findElements(By.xpath("//*[@id='block-system-main']/div/div[3]/table/tbody/tr"))
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
    .then(_ => res.send(toReturn))
    .then(_ => driver.quit())
    .then(_ => {
      var end = new Date().getTime();
      var time = end - start;
      console.log('Execution time: ' + time);
    })
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
