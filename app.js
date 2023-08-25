const express = require('express');
const mariadb = require('mariadb');
const https = require('https');
const fs = require('fs');
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'daniel',
  password: '7777',
  database: 'danielHomepage',
  connectionLimit: 100
});
const app = express();
const port = 8080;

let privateKey;
let certificate;
let bundle;

if (process.env.ENV === 'local') {
  privateKey = fs.readFileSync('/Users/daniel/.ssl/officialdaniel.com_key.txt');
  certificate = fs.readFileSync('/Users/daniel/.ssl/officialdaniel.com.crt');
  bundle = fs.readFileSync('/Users/daniel/.ssl/officialdaniel.com.ca-bundle');
} else {
  privateKey = fs.readFileSync('/home/pi/.ssl/officialdaniel.com_key.txt');
  certificate = fs.readFileSync('/home/pi/.ssl/officialdaniel.com.crt');
  bundle = fs.readFileSync('/home/pi/.ssl/officialdaniel.com.ca-bundle');
}

https
  .createServer(
    {
      key: privateKey,
      cert: certificate,
      ca: bundle
    },
    app
  )
  .listen(port);

const ipInfo = require('ipinfo');

app.use(express.static('home'));

// Middleware to log the client IP
app.use(async (req, res, next) => {
  let conn;
  try {
    conn = await pool.getConnection();
    console.log(`Request from IP: ${req.ip}`);
    const realIP = req.ip.split(':')[req.ip.split(':').length - 1];
    const realIpInfo = await ipInfo(realIP);
    const location = {
      longitude: null,
      latitude: null
    };
    console.log('realIpInfo is the following:');
    console.log(realIpInfo);
    if (realIpInfo.loc) {
      const arr = realIpInfo.loc.split(',');
      const log = arr[1];
      const lat = arr[0];
      location.longitude = log;
      location.latitude = lat;
    }
    const res = await conn.query('INSERT INTO ip_location_history (location) values (?)', [
      location
    ]);
    console.log(res);
  } catch (err) {
    console.log('get err');
    console.log(err);
  } finally {
    next();
  }
});

app.get('/ip_location_history', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const queryResult = await conn.query('SELECT * FROM ip_location_history;');
    const result = [];
    queryResult.forEach((obj) => {
      const locationStr = obj.location;
      const location = JSON.parse(locationStr);
      if (location.longitude && location.latitude) {
        result.push([parseFloat(location.longitude, 10), parseFloat(location.latitude, 10), 1]);
      }
    });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(result);
  } catch (err) {
    console.log('error during get ip_location_history');
    console.log(res);
  }
});
