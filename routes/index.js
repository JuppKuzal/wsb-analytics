var express = require('express');
var router = express.Router();

/* MongoDB Connection */


const MongoClient = require('mongodb').MongoClient;
const uri = require('../mongodb-credentials');
const client = new MongoClient(uri, { useNewUrlParser: true });

client.connect(err => {
  const collection = client.db("WSBAnalytics").collection("StockData");
  // perform actions on the collection object
  client.close();
});

/********************* */

/* Util */

function isValidStockEntry(stockEntry) {
  return !(stockEntry.ticker && stockEntry.amount);
}


/* GET all stock data */
router.get('/', (req, res) => {
  var stockData = [];

  try{
    const dbdata = await collection.get();
    
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
    console.error("Error: " + JSON.stringify(error));
    res.status(500).send();
  }
});

/* GET stock data by ticker*/
router.get('/:ticker', (req, res) => {
  var stockData = [];

  try{
    //catch bad req
    if(req.params.stockTicker === undefined) {
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
    console.error("Error: " + JSON.stringify(error));
    res.status(500).send();
  }
});

router.post('/', function(req, res, next) {
  //init
  var stockEntry = req.body;

  //400 bad req
  if(isValidStockEntry(stockEntry)) {
    res.status(400).send();
    return;
  }
  try {
    //fill request with request body
    const docRef = collection.doc();
    const createTime = Date.now();
    await docRef.set({
      ticker: stockEntry.ticker,
      amount: stockEntry.amount,
      price: stockEntry.price
    })
    stockEntry.time = createTimel
    comment.id = docRef.id;
    //send post res
    res.status(201).send(stockEntry);
  } catch (error) {
    //catch 500 internal server error
    console.error("Error: " + JSON.stringify(error));
    res.status(500).send();
  }
});

//delete by stock ticker in params
router.delete('/:ticker', function(req, res, next) {
  
  try{

    if(req.query.ticker === undefined){
      res.status(400).send();
    }

    const dbdata = await collection.where('ticker', '==', req.params.ticker).get();

    if (!dbdata.empty) {
      dbdata.forEach((doc) => {
        doc.ref.delete();
      });

      res.status(204).send();
    } else {
      //catch 404 not found
      res.status(404).send();
      return;
    }
  } catch (error) {
    //catch 500 internal server error
    console.error("Error: " + JSON.stringify(error));
    res.status(500).send();
  }

});

module.exports = router;
