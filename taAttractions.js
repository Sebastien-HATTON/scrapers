var express = require('express');
var app = express();
var webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;
// var cors = require('cors');
//app.use(cors());
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.get('/', function(req, res) {
  var start = new Date().getTime();
  var toReturn = {};
  toReturn.places = [];
  var imgs = [];
  var driver = new webdriver.Builder()
    .forBrowser('phantomjs')
    .build();
  if (req.query.placeid == undefined) {
    driver.get('https://www.tripadvisor.it/Attractions');
    driver.wait(until.elementsLocated(By.className('typeahead_input')), 3000);
    driver.findElement(By.className('typeahead_input')).sendKeys(req.query.loc);
    driver.findElement(By.id('SUBMIT_THINGS_TO_DO')).click();
  }
  else
    driver.get('https://www.tripadvisor.it/Attractions-' + req.query.placeid + "-Activities-oa" + req.query.page)
  driver.wait(until.elementLocated(By.id('HEADING')), 8000)
    .then(_ => {
      driver.sleep(1000)
      driver.getCurrentUrl()
      .then(url => toReturn.placeid = url.split("-")[1])
      driver.findElements(By.xpath("//div[@class='listing_details' and not(div[@class='photo_booking']//div[@class='noImageBorder']//img[@class='npp']) and div[@class='listing_info']/div[@class='tag_line']/div/a]"))
        .then(elements => {
          for (var i in elements) {
            var p1 = elements[i].findElement(By.css("div.listing_title ")).getText();
            var p2 = elements[i].findElement(By.css("div.photo_booking img")).getAttribute("src")
            var p3 = elements[i].findElement(By.css("div.listing_rating span.ui_bubble_rating")).getAttribute("alt")
            var p4 = elements[i].findElement(By.css("div.tag_line span")).getText()
            Promise.all([p1, p2, p3, p4])
              .then(values => {
                toReturn.places.push({
                  nome: values[0],
                  img: values[1],
                  rating: values[2].split(" ")[1].replace(",", "."),
                  tipologia: values[3]
                })
              })
          }
        })
      driver.findElements(By.xpath("//div[@class='listing_details' and div[@class='photo_booking']//div[@class='noImageBorder'] and div[@class='listing_info']/div[@class='tag_line']/div/a]"))
        .then(elements => {
          for (var i in elements) {
            var p1 = elements[i].findElement(By.css("div.listing_title ")).getText();
            var p2 = elements[i].findElement(By.css("div.tag_line span")).getText();
            Promise.all([p1, p2])
              .then(values => {
                toReturn.places.push({
                  nome: values[0],
                  tipologia: values[1]
                })
              })
          }
        })
    })
    .then(_ => {
      res.json(toReturn)
      driver.quit();
      var end = new Date().getTime();
      var time = end - start;
      console.log('Execution time: ' + time);
    })
});


app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});
