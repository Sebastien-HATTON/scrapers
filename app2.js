var express = require('express');
var app = express();
app.get('/', function(req, res) {
  var start = new Date().getTime();
  var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;
  // let chrome = require('selenium-webdriver/chrome')
  // var opt = new chrome.Options;
  var driver = new webdriver.Builder()
    .forBrowser('chrome')
    // .setChromeOptions(opt.addArguments('load-extension=C:/Users/vicec/AppData/Local/Google/Chrome/User Data/Default/Extensions/pehaalcefcjfccdpbckoablngfkfgfgj/1.1_0'))
    .build();
    // driver
  var toReturn = [];
  var imgs = [];
  driver.get('https://www.tripadvisor.it/Attractions');
  driver.wait(until.elementsLocated(By.className('typeahead_input')), 1000);
  driver.findElement(By.className('typeahead_input')).sendKeys(req.query.loc);
  driver.findElement(By.id('SUBMIT_THINGS_TO_DO')).click();
  driver.wait(until.elementLocated(By.id('HEADING')), 8000)
    // .then(_ => driver.findElements(By.css("#ATTR_ENTRY_ > div.attraction_clarity_cell > div > div > div.listing_info")))
    // .then((elem) => {
    //   for (var i = 0; i < elem.length; i++)
    //     elem[i].getText()
    //     .then((txt) => {
    //       var elems = txt.split("\n");
    //       toReturn.push({
    //         nome: elems[0],
    //         recensioni: elems[1],
    //         tipologia: elems[3]
    //       })
    //     });
    // })
    // .then(_ => driver.wait(until.elementLocated(By.css("#ATTR_ENTRY_:first-child > div.attraction_clarity_cell > div > div img.photo_image")), 5000))
    // driver.sleep(2000)
    // .then(_ => driver.findElements(By.css("#ATTR_ENTRY_ > div.attraction_clarity_cell > div > div")))
    .then(_ => driver.findElements(By.css("#ATTR_ENTRY_ > div.attraction_clarity_cell > div > div")))
    .then((elem) => {
      // console.log('After loading page: ' + time);
      for (var i = 0; i < elem.length; i++) {
        // elem[i].getText()
        //   .then((txt) => {
        //     var elems = txt.split("\n");
        //     toReturn.push({
        //       nome: elems[0],
        //       recensioni: elems[1],
        //       tipologia: elems[3]
        //     })
        //   });
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
      res.header("Access-Control-Allow-Origin", "*");
      res.json(toReturn)
    })
    .then(_ => driver.quit())
    .then(_ => {
      var end = new Date().getTime();
      var time = end - start;
      console.log('Execution time: ' + time);
    })
});


app.listen(3001, function() {
  console.log('Example app listening on port 3001!');
});
