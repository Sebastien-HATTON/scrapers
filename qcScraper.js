var express = require('express');
const NodeCache = require("node-cache");
var request = require('request');
var webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  until = webdriver.until;
var driver = new webdriver.Builder()
  .forBrowser('phantomjs')
  .build();
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
    value = myCache.get("data", true);
    res.json(value[req.query.regione]);
    var end = new Date().getTime();
    var time = end - start;
    console.log('Execution time: ' + time);
  } catch (err) {
    var toReturn = {};
    var names = [];
    var links = [];
    driver.get('http://www.quattrocalici.it/ricerca/denominazioni');
    driver.findElement(By.css('#td-outer-wrap > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row.body-content > div.td-pb-span8.td-main-content > div.wpb_raw_code.wpb_content_element.wpb_raw_html.vc_custom_1493908674521.wine-list > div > div.bootstrap-table > div.fixed-table-container > div.fixed-table-pagination > div.pull-left.pagination-detail > span.page-list > span > button'))
      .then(element => {
        driver.wait(until.elementIsVisible(element));
        tryClick(element);
        driver.findElement(By.css('#td-outer-wrap > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row.body-content > div.td-pb-span8.td-main-content > div.wpb_raw_code.wpb_content_element.wpb_raw_html.vc_custom_1493908674521.wine-list > div > div.bootstrap-table > div.fixed-table-container > div.fixed-table-pagination > div.pull-left.pagination-detail > span.page-list > span > ul > li:nth-child(4) > a'))
          .then(elem => {
            driver.wait(until.elementIsVisible(elem));
            tryClick(elem);
            driver.findElement(By.css('#td-outer-wrap > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row.body-content > div.td-pb-span8.td-main-content > div.wpb_raw_code.wpb_content_element.wpb_raw_html.vc_custom_1493908674521.wine-list > div > div.bootstrap-table > div.fixed-table-container > div.fixed-table-body > table > thead > tr > th:nth-child(3) > div.th-inner.sortable'))
              .then(regione => {
                tryClick(regione);
                scrape();
              })
          })
      })

    function scrape() {
      driver.findElements(By.css('#td-outer-wrap > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row.body-content > div.td-pb-span8.td-main-content > div.wpb_raw_code.wpb_content_element.wpb_raw_html.vc_custom_1493908674521.wine-list > div > div.bootstrap-table > div.fixed-table-container > div.fixed-table-body > table > tbody > tr'))
        .then(elems => {
          for (var i in elems)
            grabData(elems[i])
          driver.findElement(By.css('#td-outer-wrap > div.td-main-content-wrap.td-container-wrap > div > div.td-pb-row.body-content > div.td-pb-span8.td-main-content > div.wpb_raw_code.wpb_content_element.wpb_raw_html.vc_custom_1493908674521.wine-list > div > div.bootstrap-table > div.fixed-table-container > div.fixed-table-pagination > div.pull-right.pagination > ul > li.page-next'))
            .then(li => {
              li.getAttribute("class")
                .then(cl => {
                  if (cl.indexOf("disabled") == -1) {
                    li.findElement(By.css('a'))
                      .then(anchor => {
                        driver.wait(until.elementIsVisible(anchor));
                        tryClick(anchor);
                        scrape();
                      })
                  } else {
                    myCache.set("data", toReturn);
                    driver.quit();
                    var end = new Date().getTime();
                    var time = end - start;
                    console.log('Execution time: ' + time);
                  }
                })
            })

        })
    }

    function tryClick(elem) {
      elem.click()
        .then(null, _ => {
          driver.sleep(1000);
          tryClick(elem)
        })
    }
  }

  function grabData(data) {
    data.findElements(By.css('td'))
      .then(fields => {
        var p0 = fields[0].getText();
        var p1 = fields[1].getText();
        var p2 = fields[2].getText();
        var p3 = fields[3].getText();
        var p4 = fields[0].findElement(By.css('a'))
          .then(anchor => anchor.getAttribute("href"))
        Promise.all([p0, p1, p2, p3, p4])
          .then(values => {
            if (values[2] == "")
              return;
            if (values[1] == "IGP" || values[1] == "DOP") {
              var regioni = values[2].split(", ");
              for (var i in regioni) {
                var regione = regioni[i].toLowerCase().replace("-", " ");
                if (toReturn[regione] === undefined)
                  toReturn[regione] = [];
                toReturn[regione].push({
                  nome: values[0],
                  link: values[4],
                  tipologia: values[1],
                  merceologia: values[3]
                })
              }
            }
          })
      })
  }
});

app.get('/page', function(req, res) {
  request(req.query.link, function(error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    var cheerio = require('cheerio');
    $ = cheerio.load(body);
    $("#td-outer-wrap > div.td-main-content-wrap.td-main-page-wrap.td-container-wrap > div > div:nth-child(2) > div.wpb_column.vc_column_container.td-pb-span8 > div > div > div:nth-child(17) > div > div > div").remove();
    $("#td-outer-wrap > div.td-main-content-wrap.td-main-page-wrap.td-container-wrap > div > div:nth-child(2) > div.wpb_column.vc_column_container.td-pb-span8 > div > div > div:nth-child(10) > div > div > div > div.wpb_raw_code.wpb_content_element.wpb_raw_html.policy-sheet").remove();
    $("#td-outer-wrap > div.td-main-content-wrap.td-main-page-wrap.td-container-wrap > div > div:nth-child(2) > div.wpb_column.vc_column_container.td-pb-span8 > div > div > div.vc_row.wpb_row.vc_inner.td-pb-row.titling.vc_row-o-content-middle.vc_row-flex > div:nth-child(3)").remove();
    $("#td-outer-wrap > div.td-main-content-wrap.td-main-page-wrap.td-container-wrap > div > div:nth-child(2) > div.wpb_column.vc_column_container.td-pb-span8 > div > div > div.vc_row.wpb_row.vc_inner.td-pb-row.titling.vc_row-o-content-middle.vc_row-flex > div:nth-child(1) > div > div").remove();
    // res.send($("#td-outer-wrap > div.td-main-content-wrap.td-main-page-wrap.td-container-wrap > div > div:nth-child(2) > div.wpb_column.vc_column_container.td-pb-span8 > div > div").html())
    res.send({
      body: $("#td-outer-wrap > div.td-main-content-wrap.td-main-page-wrap.td-container-wrap > div > div:nth-child(2) > div.wpb_column.vc_column_container.td-pb-span8 > div > div").html()
    })
  });
});

app.listen(8080, function() {
  console.log('Example app listening on port 8080!');
});
