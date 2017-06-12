var express = require('express');
let request = require('request');
var http = require('http');
var app = express();

app.get('/', function(req, res) {
  var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
  var driver = new webdriver.Builder()
    .forBrowser('phantomjs')
    .build();
  var toReturn = [];
  var imgs = [];
  driver.get('http://www.quattrocalici.it/ricerca/denominazioni')
  driver.wait(until.elementLocated(By.id('edit-field-den-prov2-value')), 1000);
  driver.findElement(By.id('edit-field-den-prov2-value')).sendKeys(req.query.loc);
  driver.findElement(By.id('edit-submit-denominazioni')).click()
    .then(_ => driver.quit())
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
