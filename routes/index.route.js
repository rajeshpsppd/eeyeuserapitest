const express = require('express');
const path = require('path');
// const QR = require('qrcode');
const qs = require('querystring');
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

const indexRoute = express.Router();
const Sensor = require('../models/sensor');
const Order = require('../models/order');
const Vendor = require('../models/vendor');

indexRoute.get('/', (req, res, next) => {
    let keyStr = '', corsOptions;
    const key = req.query['api-key'],
    originUrl = req.header('Origin');
    console.log(key, originUrl);
    if (key) if (key.length > 0) { 
        keyStr = key + originUrl;
    }
    // console.log('Hello');
    if (key === 'mykey') {
        res.send({title: 'Hello', msg: 'Msg from server'});
    } else res.send({title: 'Hello', msg: 'Access denied'});
});
indexRoute.get('/sensors/:subscription', (req, res, next) => {
    let subscription = req.params.subscription;
    // let keyStr = '', corsOptions;
    // const key = req.query['api-key'],
    // originUrl = req.header('Origin');
    // console.log(key, originUrl);
    // if (key) if (key.length > 0) { 
    //     keyStr = key + originUrl;
    // }
    Sensor.find({'subscription':subscription}, function (err, result){
		if(err){
		  console.log(err);
		}
		else {
		  res.json(result);
		}
	  });
    // console.log('Hello');
    // if (key === 'mykey') {
    //     res.send({title: 'Hello', msg: 'Msg from server'});
    // } else res.send({title: 'Hello', msg: 'Access denied'});
});

indexRoute.get('/qr', (req, res, next) => {
    // console.log('Hello');
    res.json({title: 'Hello', msg: 'QR code from server'});
});

// indexRoute.post("/scan", (req, res) => {
//     const url = req.body.url;
//     // If the input is null return "Empty Data" error
//     if (url.length === 0) res.send("Empty Data!");
    
//     // Let us convert the input stored in the url and return it as a representation of the QR Code image contained in the Data URI(Uniform Resource Identifier)
//     // It shall be returned as a png image format
//     // In case of an error, it will save the error inside the "err" variable and display it
    
//     qr.toDataURL(url, (err, src) => {
//         if (err) res.send("Error occured");
//         // Let us return the QR code image as our response and set it to be the source used in the webpage
//         res.render("scan", { src });
//     });
// });
module.exports = indexRoute;