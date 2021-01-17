var express = require('express');
var router = express.Router();

/* Database Connection */

const admin = require('firebase-admin');

const serviceAccount = require('../google-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const collection = db.collection("StockData");

/********************* */

/* Util */

function isValidStockEntry(stockEntry) {
  return !(stockEntry.ticker && stockEntry.amount && stockEntry.price);
}

/********************* */

/* GET all stock data */
router.get('/', async (req, res) => {
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
router.get('/:ticker', async (req, res) => {
  var stockData = [];
  let ticker = req.params.ticker.toString().toUpperCase();

  try{
    //catch bad req
    if(ticker === undefined) {
      res.status(400).send();
    }
    const dbdata = await collection
                          .where("ticker", "==", ticker)
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

router.post('/', async (req, res) => {
  //init
  var stockEntry = req.body;

  let ticker = stockEntry.ticker.toString().toUpperCase();

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
      //send the ticker in uppercase from frontend!
      ticker,
      amount: stockEntry.amount,
      price: stockEntry.price
    })
    stockEntry.time = createTime;
    stockEntry.id = docRef.id;
    //send post res
    res.status(201).send(stockEntry);
  } catch (error) {
    //catch 500 internal server error
    console.error("Error: " + JSON.stringify(error));
    res.status(500).send();
  }
});

//delete by stock ticker in params
router.delete('/:ticker', async function(req, res, next) {

  let ticker = req.params.ticker.toString().toUpperCase();

  try{

    if(ticker === undefined){
      res.status(400).send();
    }

    const dbdata = await collection.where('ticker', '==', ticker).get();

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
