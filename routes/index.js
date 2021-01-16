var express = require('express');
var router = express.Router();

/* MongoDB Connection */


const MongoClient = require('mongodb').MongoClient;
const uri = uri;
const client = new MongoClient(uri, { useNewUrlParser: true });

client.connect(err => {
  const collection = client.db("WSBAnalytics").collection("StockData");
  // perform actions on the collection object
  client.close();
});


/* GET stock data */
router.get('/', (req, res) => {
  var stockData = [];

  try{
    //catch bad req
    if(req.query.stockTicker === undefined) {
      res.status(400).send();
    }
    const dbdata = await collection
                          .where("ticker", "==", req.query.stockTicker)
                          .get();
    if(dbdata.empty) {
      // 404 not found
      res.status(404).send();
    }
    
    //fill all
    dbdata.forEach((doc) => {
      var entry = doc.data();
      entry.id = doc.id;
      stockData.push(entry);
    });

    res.status(200).send(stockData);
  } catch (error) {
    //500 internal server error
    console.log("Error: " + JSON.stringify(error));
    res.status(500).send();
  }
});

router.post('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.delete('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
